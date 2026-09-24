"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  instructor_id: string;
  instructor_name: string;
};

export default function StudentCoursesPage() {
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMyCourses() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);

      if (enrollmentError) {
        console.error(enrollmentError);
        setLoading(false);
        return;
      }

      const courseIds =
        enrollments?.map((item) => item.course_id) || [];

      if (courseIds.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          instructor_id
        `)
        .in("id", courseIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      const instructorIds = [
        ...new Set(
          (data || []).map((course) => course.instructor_id)
        ),
      ];

      const { data: instructors, error: instructorError } =
        await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", instructorIds);

      if (instructorError) {
        console.error(instructorError);
      }

      const coursesWithInstructor: Course[] = (data || []).map(
        (course) => {
          const instructor = instructors?.find(
            (item) => item.id === course.instructor_id
          );

          return {
            ...course,
            instructor_name:
              instructor?.full_name || "Unknown Instructor",
          };
        }
      );

      setCourses(coursesWithInstructor);
      setLoading(false);
    }

    getMyCourses();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading your courses...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Student Learning
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            My Courses
          </h1>

          <p className="mt-2 text-slate-500">
            Continue learning from the courses you have enrolled in.
          </p>
        </div>

        <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
            📚
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">
              Enrolled Courses
            </p>

            <p className="text-xl font-bold text-slate-900">
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
              You haven't enrolled in any courses yet.
              Explore our courses and start your learning journey.
            </p>

            <Link
              href="/courses"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-400">
                    No Thumbnail
                  </div>
                )}
                <div className="p-6">

                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    Enrolled
                  </span>

                  <h2 className="mt-3 text-xl font-bold text-slate-900">
                    {course.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm">
                      👨‍🏫
                    </div>

                    <p className="text-sm text-slate-500">
                      Instructor{" "}
                      <span className="font-semibold text-slate-700">
                        {course.instructor_name}
                      </span>
                    </p>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                    {course.description ||
                      "No description available."}
                  </p>

                  <Link
                    href={`/student/learn/${course.id}`}
                    className="mt-5 flex w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Continue Learning →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}