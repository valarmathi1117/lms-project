"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase";
import { courseSchema } from "@/lib/validation";
import { Button } from "@base-ui/react/button";

export default function CreateCoursePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    async function getCategories() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) {
        console.error(error);
        return;
      }

      setCategories(data || []);
    }

    getCategories();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validation = courseSchema.safeParse({
      title,
      description,
      categoryId: category,
    });

    if (!validation.success) {
      alert(
        validation.error.issues[0]?.message || "Invalid input"
      );
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        instructor_id: user.id,
        title,
        description,
        category_id: category,
      })
      .select()
      .single();

    if (courseError) {
      console.error(courseError);
      alert(courseError.message);
      return;
    }
    if (thumbnail) {
      const fileName = `${user.id}/${Date.now()}-${thumbnail.name}`;

      const { error: uploadError } = await supabase.storage
        .from("course-thumbnails")
        .upload(fileName, thumbnail);

      if (uploadError) {
        console.error(uploadError);
        alert(uploadError.message);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(fileName);

      const thumbnailUrl = publicUrlData.publicUrl;
      const { error: updateError } = await supabase
        .from("courses")
        .update({
          thumbnail_url: thumbnailUrl,
        })
        .eq("id", course.id);

      if (updateError) {
        console.error(updateError);
        alert(updateError.message);
        return;
      }
    }

    alert("Course created successfully! 🎉");

    setTitle("");
    setDescription("");
    setCategory("");
    setThumbnail(null);
  }

  useEffect(() => {
    async function checkInstructor() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "instructor") {
        window.location.href = "/login";
        return;
      }
    }

    checkInstructor();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-sm">
              📚
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Instructor Panel
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Create New Course
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
            Create a professional learning experience for your students.
            Add your course information, choose a category, and upload a
            course thumbnail.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-8 py-6">
              <h2 className="text-lg font-bold text-slate-900">
                Course Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the basic details of your course.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-7 p-8"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Course Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"/>

                <p className="mt-2 text-xs text-slate-400">
                  Choose a clear and descriptive title for your course.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Course Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what students will learn..."
                  rows={6}
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Give students a clear idea of what they will learn.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">
                    Select a category
                  </option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Course Thumbnail
                </label>

                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-blue-400 hover:bg-blue-50/30">

                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-blue-100 text-3xl">
                    🖼️
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setThumbnail(
                        e.target.files?.[0] || null
                      )
                    }
                    className="w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                  />

                  <p className="mt-3 text-xs text-slate-500">
                    Upload an image for your course.
                  </p>

                  {thumbnail && (
                    <p className="mt-2 text-xs font-medium text-green-600">
                      ✓ {thumbnail.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <Button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Create Course 🚀
                </Button>
              </div>
            </form>
          </div>
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Course Preview
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  How your course will appear
                </h2>
              </div>
              <div className="flex h-44 items-center justify-center bg-slate-100">
                {thumbnail ? (
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    alt="Course preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl">📚</div>
                    <p className="mt-2 text-xs text-slate-400">
                      Course thumbnail
                    </p>
                  </div>
                )}
              </div>
              <div className="p-6">

                <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {category
                    ? categories.find(
                        (item) => item.id === category
                      )?.name
                    : "Category"}
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {title || "Your Course Title"}
                </h3>

                <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-500">
                  {description ||
                    "Your course description will appear here once you add it."}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>LearnHub Course</span>
                    <span>📖 Lessons</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Course Creation
              </p>

              <div className="mt-5 space-y-4">

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Course Information
                    </p>
                    <p className="text-xs text-slate-400">
                      Title and description
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Add Lessons
                    </p>
                    <p className="text-xs text-slate-400">
                      Build your course content
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                    3
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Publish
                    </p>
                    <p className="text-xs text-slate-400">
                      Share with students
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}