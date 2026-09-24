"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const supabase = createClient();

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  async function fetchCourse() {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        categories(name),
        profiles(full_name)
      `)
      .eq("id", courseId)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setCourse(data);

    const { data: lessonData } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("lesson_order", { ascending: true });

    setLessons(lessonData || []);
    setLoading(false);
  }

  async function handleEnroll() {
    setEnrolling(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login before enrolling.");
      setEnrolling(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "student") {
      setMessage("Only students can enroll in courses.");
      setEnrolling(false);
      return;
    }

    const { error } = await supabase.from("enrollments").insert({
      student_id: user.id,
      course_id: courseId,
    });

    if (error) {
      if (error.code === "23505") {
        setMessage("You are already enrolled in this course.");
      } else {
        console.error(error);
        setMessage("Something went wrong. Please try again.");
      }
    } else {
      setMessage("🎉 Successfully enrolled in the course!");
    }

    setEnrolling(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-10">
        <p>Loading course...</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50 p-10">
        <p>Course not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex h-80 items-center justify-center overflow-hidden rounded-2xl bg-gray-200 text-8xl">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              "💻"
            )}
          </div>
          <div>
            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium">
              {course.categories?.name || "Course"}
            </span>

            <h1 className="mt-5 text-4xl font-bold">
              {course.title}
            </h1>

            <p className="mt-4 leading-7 text-gray-600">
              {course.description}
            </p>

            <div className="mt-6 space-y-3 text-gray-600">
              <p>
                👨‍🏫 Instructor:{" "}
                {course.profiles?.full_name || "Instructor"}
              </p>

              <p>📚 {lessons.length} Lessons</p>
            </div>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="mt-8 w-full rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50 md:w-auto"
            >
              {enrolling ? "Enrolling..." : "Enroll Now 🎓"}
            </button>
            {message && (
              <p className="mt-4 font-medium">
                {message}
              </p>
            )}
          </div>
        </div>
        <section className="mt-16 rounded-xl border bg-white p-8">
          <h2 className="text-2xl font-bold">
            About This Course
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            {course.description}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            Course Lessons 📖
          </h2>

          <div className="mt-6 space-y-4">
            {lessons.length === 0 ? (
              <p className="text-gray-600">
                No lessons available yet.
              </p>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-xl border bg-white p-5"
                >
                  <h3 className="font-semibold">
                    Lesson {lesson.lesson_order} — {lesson.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    {lesson.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
        <div className="mt-10">
          <Link
            href="/courses"
            className="font-semibold hover:underline"
          >
            ← Back to Courses
          </Link>
        </div>

      </div>
    </main>
  );
}