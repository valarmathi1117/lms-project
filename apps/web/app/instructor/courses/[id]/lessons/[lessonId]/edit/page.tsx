"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function EditLessonPage() {
  const params = useParams();

  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [lessonOrder, setLessonOrder] = useState("1");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function getLesson() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: course } = await supabase
        .from("courses")
        .select("id")
        .eq("id", courseId)
        .eq("instructor_id", user.id)
        .single();

      if (!course) {
        alert("Course not found.");
        window.location.href = "/instructor/courses";
        return;
      }

      const { data: lesson, error } = await supabase
        .from("lessons")
        .select(
          "title, description, video_url, content, lesson_order"
        )
        .eq("id", lessonId)
        .eq("course_id", courseId)
        .single();

      if (error) {
        console.error(error);
        alert("Lesson not found.");
        window.location.href = `/instructor/courses/${courseId}/lessons`;
        return;
      }

      setTitle(lesson.title);
      setDescription(lesson.description || "");
      setVideoUrl(lesson.video_url || "");
      setContent(lesson.content || "");
      setLessonOrder(String(lesson.lesson_order));

      setLoading(false);
    }

    getLesson();
  }, [courseId, lessonId]);

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Lesson title is required.");
      return;
    }

    setUpdating(true);

    const { error } = await supabase
      .from("lessons")
      .update({
        title,
        description,
        video_url: videoUrl,
        content,
        lesson_order: Number(lessonOrder),
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId)
      .eq("course_id", courseId);

    if (error) {
      console.error(error);
      alert(error.message);
      setUpdating(false);
      return;
    }

    alert("Lesson updated successfully! 🎉");

    window.location.href = `/instructor/courses/${courseId}/lessons`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading lesson...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <Link
          href={`/instructor/courses/${courseId}/lessons`}
          className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          ← Back to Lessons
        </Link>
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Course Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Edit Lesson
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Update the lesson information and learning content.
          </p>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  ✏️
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Lesson Information
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Make changes to this lesson.
                  </p>
                </div>
              </div>
            </div>
            <form
              onSubmit={handleUpdate}
              className="space-y-6 p-6 sm:p-8"
            >
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Lesson Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter lesson title"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter lesson description"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
                <div>
                  <label
                    htmlFor="videoUrl"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Video URL
                  </label>

                  <input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Optional
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="lessonOrder"
                    className="mb-2 block text-sm font-semibold text-slate-700">
                    Lesson Order
                  </label>

                  <input
                    id="lessonOrder"
                    type="number"
                    min="1"
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/>
                </div>
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-semibold text-slate-700">
                  Lesson Content
                </label>

                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter lesson content"
                  rows={10}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

                <Link
                  href={`/instructor/courses/${courseId}/lessons`}
                  className="rounded-lg border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating Lesson..." : "Update Lesson"}
                </button>

              </div>

            </form>
          </div>
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📝
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Editing Lesson
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Update the lesson details whenever you need to improve or
              correct the learning material.
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Remember
              </p>

              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="text-blue-600">✓</span>
                  Keep the lesson title clear.
                </li>

                <li className="flex gap-2">
                  <span className="text-blue-600">✓</span>
                  Keep the content easy to understand.
                </li>

                <li className="flex gap-2">
                  <span className="text-blue-600">✓</span>
                  Maintain the correct lesson order.
                </li>

                <li className="flex gap-2">
                  <span className="text-blue-600">✓</span>
                  Add a video when useful.
                </li>
              </ul>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}