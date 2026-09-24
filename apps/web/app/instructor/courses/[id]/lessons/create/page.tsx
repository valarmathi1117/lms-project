"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function CreateLessonPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [lessonOrder, setLessonOrder] = useState("1");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Lesson title is required.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("lessons").insert({
      course_id: courseId,
      title,
      description,
      video_url: videoUrl,
      content,
      lesson_order: Number(lessonOrder),
    });

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Lesson created successfully! 🎉");

    window.location.href = `/instructor/courses/${courseId}/lessons`;
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
            Create New Lesson
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Add a new lesson with learning content and optional video material.
          </p>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  📖
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Lesson Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the details students will see while learning.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700">
                  Lesson Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to React"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Give your lesson a clear and descriptive title.
                </p>
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
                  placeholder="Briefly describe what students will learn..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
                <div>
                  <label
                    htmlFor="videoUrl"
                    className="mb-2 block text-sm font-semibold text-slate-700">
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
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Lesson Order
                  </label>

                  <input
                    id="lessonOrder"
                    type="number"
                    min="1"
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    1, 2, 3...
                  </p>
                </div>
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Lesson Content
                </label>

                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the lesson content here..."
                  rows={10}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Add the main learning material students should read or study.
                </p>
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
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating Lesson..." : "Create Lesson"}
                </button>

              </div>

            </form>
          </div>
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              💡
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Lesson Tips
            </h2>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Keep titles clear
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use short titles that clearly explain the topic.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Add useful content
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Give students enough information to understand the lesson.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Use lesson order
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Number lessons in the order students should complete them.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Video is optional
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Add a video URL when the lesson includes video learning.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}