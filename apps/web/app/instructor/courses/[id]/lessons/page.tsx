"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  lesson_order: number;
};

export default function LessonsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const supabase = createClient();

  const [courseTitle, setCourseTitle] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleDelete(lessonId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId)
      .eq("course_id", courseId);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setLessons((currentLessons) =>
      currentLessons.filter((lesson) => lesson.id !== lessonId)
    );

    alert("Lesson deleted successfully! 🗑️");
  }

  useEffect(() => {
    async function getLessons() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "instructor") {
        window.location.href = "/login";
        return;
      }

      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .eq("instructor_id", user.id)
        .single();

      if (courseError) {
        console.error(courseError);
        alert("Course not found.");
        window.location.href = "/instructor/courses";
        return;
      }

      setCourseTitle(course.title);

      const { data, error } = await supabase
        .from("lessons")
        .select(
          "id, title, description, video_url, content, lesson_order"
        )
        .eq("course_id", courseId)
        .order("lesson_order", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setLessons(data || []);
      }

      setLoading(false);
    }

    getLessons();
  }, [courseId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading lessons...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <Link
          href="/instructor/courses"
          className="text-sm font-semibold text-slate-500 transition hover:text-blue-600">
          ← Back to My Courses
        </Link>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Course Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {courseTitle}
            </h1>
            <p className="mt-2 text-slate-500">
              Create and manage lessons for this course.
            </p>
          </div>
          <Link
            href={`/instructor/courses/${courseId}/lessons/create`}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Create Lesson
          </Link>
        </div>
        <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
            📖
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Lessons
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {lessons.length}
            </p>
          </div>
        </div>
        {lessons.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
              📖
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No lessons yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Start building your course by adding your first lesson.
            </p>

            <Link
              href={`/instructor/courses/${courseId}/lessons/create`}
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create First Lesson
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                      {lesson.lesson_order}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Lesson {lesson.lesson_order}
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        {lesson.title}
                      </h2>

                      {lesson.description && (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                          {lesson.description}
                        </p>
                      )}

                      {lesson.video_url && (
                        <span className="mt-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Video Available
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <Link
                      href={`/instructor/courses/${courseId}/lessons/${lesson.id}/edit`}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(lesson.id)}
                      className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}