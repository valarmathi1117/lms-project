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

    const { data: enrollment, error: enrollmentError } = await supabase
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
    const { data: courseData, error: courseError } = await supabase
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
    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons")
      .select(
        "id, title, description, content, lesson_order"
      )
      .eq("course_id", courseId)
      .order("lesson_order", { ascending: true });

    if (lessonError) {
      console.error(lessonError);
      setErrorMessage("Unable to load course lessons.");
      setLoading(false);
      return;
    }

    const currentLessons = lessonData || [];

    setLessons(currentLessons);
    const lessonIds = currentLessons.map((lesson) => lesson.id);

    if (lessonIds.length === 0) {
      setCompletedLessons([]);
      setLoading(false);
      return;
    }

    const { data: progressData, error: progressError } =
      await supabase
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
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
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
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to open course
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
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
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Course not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              The course you are looking for does not exist.
            </p>
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
          Math.round((completedCount / lessons.length) * 100)
        )
      : 0;

  const isCourseCompleted =
    lessons.length > 0 && completedCount === lessons.length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-sm">
          {course.thumbnail_url && (
            <div className="h-56 w-full overflow-hidden sm:h-64">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="px-8 py-10 sm:px-10">

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
                My Learning
              </span>

              {isCourseCompleted && (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                  Completed
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {course.title}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              {course.description ||
                "Complete the lessons below and continue building your skills."}
            </p>
          </div>
          <div className="border-t border-slate-700 bg-slate-800 px-8 py-6 sm:px-10">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium text-slate-300">
                  Course Progress
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {progress}%
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-sm font-medium text-slate-300">
                  {completedCount} of {lessons.length} lessons
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {isCourseCompleted
                    ? "All lessons completed"
                    : "Keep going to complete the course"}
                </p>
              </div>

            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

          </div>
        </div>
        <div className="mt-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Course Lessons
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complete each lesson to track your learning progress.
              </p>
            </div>

            <div className="text-sm font-medium text-slate-500">
              {completedCount}/{lessons.length} completed
            </div>
          </div>
          {lessons.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl">
                📖
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No lessons available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your instructor has not added any lessons yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(
                  lesson.id
                );

                return (
                  <div
                    key={lesson.id}
                    className={`rounded-2xl border bg-white p-6 shadow-sm transition ${
                      isCompleted
                        ? "border-green-200 bg-green-50/30"
                        : "border-slate-200 hover:border-blue-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            isCompleted
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {isCompleted
                            ? "✓"
                            : lesson.lesson_order}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                          {lesson.content && (
                            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-5">
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
                        className={`shrink-0 rounded-lg px-5 py-3 text-sm font-semibold transition ${
                          isCompleted
                            ? "cursor-not-allowed bg-green-100 text-green-700"
                            : "bg-slate-900 text-white hover:bg-blue-600"
                        }`}
                      >
                        {isCompleted
                          ? "Completed ✓"
                          : "Mark Complete"}
                      </button>

                    </div>
                  </div>
                );
              })}

            </div>
          )}
          {isCourseCompleted && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-green-200 bg-green-50">
              <div className="p-6">
                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
                    ✓
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-green-800">
                      Course completed!
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-green-700">
                      Great job! You have successfully completed
                      all the lessons in this course.
                    </p>

                    <p className="mt-3 text-sm font-semibold text-green-800">
                      You can now review the lessons whenever you
                      want.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}