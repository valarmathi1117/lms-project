"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  category_id: string;
  categories: {
    name: string;
  } | null;
};

export default function CoursesPage() {
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          category_id,
          categories(name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setCourses((data || []) as unknown as Course[]);
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: enrollments, error: enrollmentError } =
        await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", user.id);

      if (enrollmentError) {
        console.error(enrollmentError);
      } else {
        const ids =
          enrollments?.map((item) => item.course_id) || [];

        setEnrolledCourseIds(ids);
      }

      setLoading(false);
    }

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.description || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const courseCategory =
      course.categories?.name || "Course";

    const matchesCategory =
      category === "All Categories" ||
      courseCategory === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            LearnHub
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Explore Courses
          </h1>

          <p className="mt-3 text-slate-500">
            Discover professional courses and build new skills.
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option>All Categories</option>
            <option>Web Development</option>
            <option>Frontend</option>
            <option>Backend</option>
            <option>Database</option>
            <option>Programming</option>
            <option>Tools</option>
          </select>
        </div>
        {!loading && (
          <div className="mt-10">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredCourses.length}
              </span>{" "}
              course{filteredCourses.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500">
              Loading courses...
            </p>
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
              📚
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No courses found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try a different search or category.
            </p>
          </div>
        )}

        {!loading && filteredCourses.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const courseCategory =
                course.categories?.name || "Course";

              const isEnrolled = enrolledCourseIds.includes(
                course.id
              );

              return (
                <div
                  key={course.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-48 overflow-hidden bg-slate-100">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        📚
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {courseCategory}
                    </span>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                      {course.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {course.description ||
                        "Learn practical skills with this course."}
                    </p>
                    {isEnrolled ? (
                      <Link
                        href={`/student/learn/${course.id}`}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <span>✓</span>
                        <span>Enrolled</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/courses/${course.id}`}
                        className="mt-5 block rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
                      >
                        View Course →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}