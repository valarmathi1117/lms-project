"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function InstructorDashboard() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [courseCount, setCourseCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboardData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "instructor") {
        window.location.href = "/login";
        return;
      }

      setName(profile.full_name || "Instructor");

      const { data: courses, error: courseError } =
        await supabase
          .from("courses")
          .select("id")
          .eq("instructor_id", user.id);

      if (courseError) {
        console.error(courseError);
        setLoading(false);
        return;
      }

      setCourseCount(courses?.length || 0);

      const courseIds =
        courses?.map((course) => course.id) || [];

      if (courseIds.length > 0) {

       const {
          data: enrollments,
          error: enrollmentError,
        } = await supabase
          .from("enrollments")
          .select("student_id")
          .in("course_id", courseIds);

        if (enrollmentError) {
          console.error(enrollmentError);
        } else {
          const uniqueStudents = new Set(
            enrollments?.map(
              (item) => item.student_id
            ) || []
          );

          setStudentCount(uniqueStudents.size);
        }

        const {
          data: lessons,
          error: lessonError,
        } = await supabase
          .from("lessons")
          .select("id")
          .in("course_id", courseIds);

        if (lessonError) {
          console.error(lessonError);
        } else {
          setLessonCount(lessons?.length || 0);
        }
      } else {
        setStudentCount(0);
        setLessonCount(0);
      }

      setLoading(false);
    }

    getDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Instructor Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {name}
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your courses, lessons, and learners from one place.
            </p>
          </div>

          <Link
            href="/instructor/courses/create"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Create Course
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  My Courses
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {courseCount}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Courses created
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                📚
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {studentCount}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Unique learners enrolled
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
                👥
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Lessons
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {lessonCount}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Lessons across your courses
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl">
                📖
              </div>
            </div>
          </div>

        </div>
        <div className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your learning content quickly.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Link
              href="/instructor/courses"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  📋
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">
                    Manage Courses
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    View, edit, and manage all the courses you have created.
                  </p>

                  <p className="mt-4 text-sm font-semibold text-blue-600">
                    View My Courses →
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/instructor/courses/create"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xl">
                  +
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">
                    Create New Course
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Create a new course and start adding lessons for your learners.
                  </p>

                  <p className="mt-4 text-sm font-semibold text-blue-600">
                    Create Course →
                  </p>
                </div>
              </div>
            </Link>

          </div>
        </div>
        <div className="mt-10 rounded-2xl bg-slate-900 p-8 text-white">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              LearnHub Instructor
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Build courses that help learners grow.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Create structured courses, add lessons, and help students
              track their learning progress through LearnHub.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}