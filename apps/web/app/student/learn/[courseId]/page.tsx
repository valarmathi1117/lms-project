"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useLearningStore } from "@/lib/store";

type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  lesson_order: number;
};

export default function LearnCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const setSelectedCourseId = useLearningStore(
    (state) => state.setSelectedCourseId
  );

  const supabase = createClient();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, [courseId, setSelectedCourseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  async function fetchCourse() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "student") {
      window.location.href = "/login";
      return;
    }

    const { data: enrollment, error: enrollmentError } =
      await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

    if (enrollmentError) {
      console.error(enrollmentError);
      setErrorMessage("Unable to verify your course enrollment.");
      setLoading(false);
      return;
    }

    if (!enrollment) {
      setErrorMessage(
        "You are not enrolled in this course. Please enroll before starting the course."
      );
      setLoading(false);
      return;
    }

    const { data: courseData, error: courseError } =
      await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url")
        .eq("id", courseId)
        .single();

    if (courseError) {
      console.error(courseError);
      setErrorMessage("Unable to load this course.");
      setLoading(false);
      return;
    }

    setCourse(courseData);

    
    const { data: lessonData, error: lessonError } =
      await supabase
        .from("lessons")
        .select(
          "id, title, description, video_url, content, lesson_order"
        )
        .eq("course_id", courseId)
        .order("lesson_order", { ascending: true });

    if (lessonError) {
      console.error(lessonError);
      setErrorMessage("Unable to load course lessons.");
      setLoading(false);
      return;
    }

    const currentLessons: Lesson[] = lessonData || [];

    console.log("LESSONS:", currentLessons);

    setLessons(currentLessons);

    const lessonIds = currentLessons.map(
      (lesson) => lesson.id
    );

    if (lessonIds.length === 0) {
      setCompletedLessons([]);
      setLoading(false);
      return;
    }

    const {
      data: progressData,
      error: progressError,
    } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("student_id", user.id)
      .eq("completed", true)
      .in("lesson_id", lessonIds);

    if (progressError) {
      console.error(progressError);
      setCompletedLessons([]);
    } else {
      setCompletedLessons(
        progressData?.map((item) => item.lesson_id) || []
      );
    }

    setLoading(false);
  }

  async function markComplete(lessonId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (completedLessons.includes(lessonId)) {
      return;
    }

    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          student_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "student_id,lesson_id",
        }
      );

    if (error) {
      console.error(error);
      alert("Unable to update lesson progress.");
      return;
    }

    setCompletedLessons((prev) => {
      if (prev.includes(lessonId)) {
        return prev;
      }

      return [...prev, lessonId];
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-500">
              Loading your course...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-3xl text-red-500">!</div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to open course
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {errorMessage}
            </p>

            <button
              onClick={() => window.history.back()}
              className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-2xl bg-white p-12 text-center">
            <h2 className="text-xl font-bold">
              Course not found
            </h2>
          </div>
        </div>
      </main>
    );
  }

  const completedCount = lessons.filter((lesson) =>
    completedLessons.includes(lesson.id)
  ).length;

  const progress =
    lessons.length > 0
      ? Math.min(
          100,
          Math.round(
            (completedCount / lessons.length) * 100
          )
        )
      : 0;

  const isCourseCompleted =
    lessons.length > 0 &&
    completedCount === lessons.length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">

       
        <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-sm">

          {course.thumbnail_url && (
            <div className="h-56 overflow-hidden">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="px-8 py-10">
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              MY LEARNING
            </span>

            <h1 className="mt-4 text-3xl font-bold text-white">
              {course.title}
            </h1>

            <p className="mt-4 max-w-3xl text-slate-300">
              {course.description ||
                "Complete the lessons below and continue building your skills."}
            </p>
          </div>

          <div className="border-t border-slate-700 bg-slate-800 px-8 py-6">

            <div className="flex justify-between">
              <div>
                <p className="text-sm text-slate-300">
                  Course Progress
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {progress}%
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-300">
                  {completedCount} of {lessons.length} lessons
                </p>
              </div>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

          </div>
        </div>

        <div className="mt-10">

          <h2 className="text-2xl font-bold text-slate-900">
            Course Lessons
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Watch the lesson video and complete each lesson.
          </p>

          {lessons.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-10 text-center">
              <p className="text-slate-500">
                No lessons available.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">

              {lessons.map((lesson) => {

                const isCompleted =
                  completedLessons.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className={`rounded-2xl border bg-white p-6 shadow-sm ${
                      isCompleted
                        ? "border-green-200"
                        : "border-slate-200"
                    }`}
                  >

                    <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">

                      <div className="flex gap-4">

                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${
                            isCompleted
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {isCompleted
                            ? "✓"
                            : lesson.lesson_order}
                        </div>

                        <div className="min-w-0">

                          <p className="text-xs font-semibold uppercase text-slate-400">
                            Lesson {lesson.lesson_order}
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-slate-900">
                            {lesson.title}
                          </h3>

                          {lesson.description && (
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {lesson.description}
                            </p>
                          )}

                          <div className="mt-5">

                            {lesson.video_url &&
                            lesson.video_url.trim() !== "" ? (
                              <a
                                href={lesson.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                              >
                                🎥 Watch Lesson Video
                              </a>
                            ) : (
                              <p className="text-sm font-medium text-red-500">
                                Video URL not available for this lesson.
                              </p>
                            )}

                          </div>

                          
                          {lesson.content && (
                            <div className="mt-5 rounded-xl bg-slate-50 p-5">
                              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                                {lesson.content}
                              </p>
                            </div>
                          )}

                        </div>
                      </div>

                      
                     <button
  type="button"
  onClick={() => markComplete(lesson.id)}
  disabled={isCompleted}
  className={`shrink-0 self-start rounded-md border px-3 py-2 text-xs font-medium transition-all duration-200 ${
    isCompleted
      ? "cursor-default border-green-200 bg-green-50 text-green-700"
      : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
  }`}
>
  {isCompleted ? "✓ Completed" : "Mark as Complete"}
</button>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

          {isCourseCompleted && (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
              <h3 className="text-lg font-bold text-green-800">
                Course completed! 🎉
              </h3>

              <p className="mt-2 text-sm text-green-700">
                You have successfully completed all lessons.
              </p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}