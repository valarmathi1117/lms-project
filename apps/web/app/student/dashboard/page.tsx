"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type CourseProgress = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  progress: number;
  completedLessons: number;
  totalLessons: number;
};

export default function StudentDashboard() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [courseCount, setCourseCount] = useState(0);
  const [completedCourseCount, setCompletedCourseCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboardData() {
      try {
        
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile error:", profileError);
        }

        if (profile?.role !== "student") {
          window.location.href = "/login";
          return;
        }

        setName(profile.full_name || "Student");

        const { data: enrollments, error: enrollmentError } =
          await supabase
            .from("enrollments")
            .select("course_id")
            .eq("student_id", user.id);

        if (enrollmentError) {
          console.error("Enrollment error:", enrollmentError);
          setLoading(false);
          return;
        }

        const enrolledCourseIds = [
          ...new Set(
            enrollments?.map((item) => item.course_id) || []
          ),
        ];

        setCourseCount(enrolledCourseIds.length);
        if (enrolledCourseIds.length === 0) {
          setCompletedCourseCount(0);
          setProgress(0);
          setCourses([]);
          setLoading(false);
          return;
        }

        const { data: courseData, error: courseError } =
          await supabase
            .from("courses")
            .select("id, title, thumbnail_url")
            .in("id", enrolledCourseIds);

        if (courseError) {
          console.error("Course error:", courseError);
        }

        const { data: lessons, error: lessonError } =
          await supabase
            .from("lessons")
            .select("id, course_id")
            .in("course_id", enrolledCourseIds);

        if (lessonError) {
          console.error("Lesson error:", lessonError);
        }

        const { data: completedLessons, error: progressError } =
          await supabase
            .from("lesson_progress")
            .select("lesson_id")
            .eq("student_id", user.id)
            .eq("completed", true);

        if (progressError) {
          console.error("Progress error:", progressError);
        }

        const completedLessonIds = new Set(
          completedLessons?.map((item) => item.lesson_id) || []
        );

        const courseProgressList: CourseProgress[] = [];

        let totalProgress = 0;
        let completedCourses = 0;

        for (const course of courseData || []) {
          const courseLessons =
            lessons?.filter(
              (lesson) => lesson.course_id === course.id
            ) || [];

          const totalLessons = courseLessons.length;

          const completedCount = courseLessons.filter((lesson) =>
            completedLessonIds.has(lesson.id)
          ).length;

          let courseProgress = 0;

          if (totalLessons > 0) {
            courseProgress = Math.round(
              (completedCount / totalLessons) * 100
            );
          }

          courseProgress = Math.min(100, courseProgress);

          if (
            totalLessons > 0 &&
            completedCount >= totalLessons
          ) {
            completedCourses++;
            courseProgress = 100;
          }

          totalProgress += courseProgress;

          courseProgressList.push({
            id: course.id,
            title: course.title,
            thumbnail_url: course.thumbnail_url,
            progress: courseProgress,
            completedLessons: completedCount,
            totalLessons,
          });
        }


        const overallProgress =
          courseProgressList.length > 0
            ? Math.round(
                totalProgress / courseProgressList.length
              )
            : 0;

        setCompletedCourseCount(completedCourses);
        setProgress(Math.min(100, overallProgress));
        setCourses(courseProgressList);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    getDashboardData();
  }, []);


  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading your learning dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <section className="overflow-hidden rounded-2xl bg-slate-900 shadow-sm">
          <div className="relative px-8 py-10 sm:px-10">
            <div className="relative z-10 max-w-2xl">

              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                Student Dashboard
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Welcome back, {name}! 👋
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Keep learning, track your progress, and continue
                building skills that move your career forward.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  href="/student/courses"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  My Courses →
                </Link>

                <Link
                  href="/courses"
                  className="inline-flex items-center rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  Explore Courses
                </Link>

              </div>
            </div>

            <div className="pointer-events-none absolute -right-10 -top-20 hidden h-72 w-72 rounded-full bg-blue-600/10 blur-3xl lg:block" />
          </div>
        </section>
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Enrolled Courses
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {courseCount}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Courses currently learning
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                📚
              </div>

            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Completed Courses
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {completedCourseCount}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Courses completed
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
                🏆
              </div>

            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Overall Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {progress}%
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Across your enrolled courses
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl">
                📈
              </div>

            </div>

            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-700"
                style={{
                  width: `${Math.min(100, progress)}%`,
                }}
              />
            </div>
          </div>

        </section>
        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            href="/student/courses"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                📚
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">
                  My Courses
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View your enrolled courses and continue your
                  learning journey.
                </p>

                <p className="mt-4 text-sm font-semibold text-blue-600">
                  View My Courses →
                </p>
              </div>

            </div>
          </Link>

          <Link
            href="/courses"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-xl">
                🔎
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">
                  Explore More Courses
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Discover new courses and expand your skills
                  with LearnHub.
                </p>

                <p className="mt-4 text-sm font-semibold text-blue-600">
                  Explore Courses →
                </p>
              </div>

            </div>
          </Link>

        </section>

        <section className="mt-10 overflow-hidden rounded-2xl bg-slate-900 px-8 py-8 text-white shadow-sm">
          <div className="max-w-3xl">

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Keep Learning
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Every completed course is a step forward. 🚀
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Stay consistent, complete your lessons, and keep
              building valuable skills through LearnHub.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}