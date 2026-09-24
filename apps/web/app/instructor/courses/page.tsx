"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { Pencil } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
};

export default function InstructorCoursesPage() {
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCourses() {
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

      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url")
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setCourses(data || []);
      }

      setLoading(false);
    }

    getCourses();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">Loading your courses...</p>
          </div>
        </div>
      </main>
    );
  }

  async function handleDeleteCourse(courseId: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this course? This action cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/login";
    return;
  }

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .eq("instructor_id", user.id);

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }
  setCourses((currentCourses) =>
    currentCourses.filter((course) => course.id !== courseId)
  );

  alert("Course deleted successfully!");
}
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Instructor Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              My Courses
            </h1>

            <p className="mt-2 text-slate-500">
              Create, manage, and organize your learning content.
            </p>
          </div>

          <Link
            href="/instructor/courses/create"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Create Course
          </Link>
        </div>
        <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
            📚
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Courses
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {courses.length}
            </p>
          </div>
        </div>
        {courses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
              📚
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No courses yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't created any courses yet. Create your first course
              and start building your learning content.
            </p>

            <Link
              href="/instructor/courses/create"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="h-48 overflow-hidden bg-slate-100">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <div className="text-center">
                        <div className="text-4xl">📚</div>
                        <p className="mt-2 text-xs">No Thumbnail</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    Your Course
                  </span>

                  <h2 className="mt-3 text-xl font-bold text-slate-900">
                    {course.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {course.description || "No description available."}
                  </p>
               <div className="mt-6 flex items-center gap-2.5 border-t border-slate-100 pt-5">
                <Link
                  href={`/instructor/courses/${course.id}/lessons`}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-blue-600">
                    <span>📖</span>
                     <span>Lessons</span>
                      </Link>
                      <Link
                      href={`/instructor/courses/${course.id}/edit`}
                       title="Edit course"
                       aria-label="Edit course"
                       className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                        <Pencil size={18} strokeWidth={2} />
                        </Link>
                        <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id)}
                        title="Delete course"
                        aria-label="Delete course"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100" >
                          <Trash2 size={18} strokeWidth={2} />
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