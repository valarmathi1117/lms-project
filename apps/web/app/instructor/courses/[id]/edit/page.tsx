"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ImagePlus, X } from "lucide-react";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function getCourse() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: course, error } = await supabase
        .from("courses")
        .select("title, description, thumbnail_url")
        .eq("id", courseId)
        .eq("instructor_id", user.id)
        .single();

      if (error) {
        console.error(error);
        alert("Course not found.");
        window.location.href = "/instructor/courses";
        return;
      }

      setTitle(course.title);
      setDescription(course.description || "");
      setThumbnailUrl(course.thumbnail_url || null);

      setLoading(false);
    }

    getCourse();
  }, [courseId]);

  function handleThumbnailChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setThumbnail(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function removeNewThumbnail() {
    setThumbnail(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
  }

  async function handleUpdate() {
    if (!title.trim()) {
      alert("Course title is required.");
      return;
    }

    setUpdating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    let finalThumbnailUrl = thumbnailUrl;
    if (thumbnail) {
      const fileName = `${user.id}/${Date.now()}-${thumbnail.name}`;

      const { error: uploadError } = await supabase.storage
        .from("course-thumbnails")
        .upload(fileName, thumbnail);

      if (uploadError) {
        console.error(uploadError);
        alert(uploadError.message);
        setUpdating(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(fileName);

      finalThumbnailUrl = publicUrlData.publicUrl;
    }
    const { error } = await supabase
      .from("courses")
      .update({
        title: title.trim(),
        description: description.trim(),
        thumbnail_url: finalThumbnailUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId)
      .eq("instructor_id", user.id);

    if (error) {
      console.error(error);
      alert(error.message);
      setUpdating(false);
      return;
    }

    alert("Course updated successfully! 🎉");

    window.location.href = "/instructor/courses";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading course...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
              ✏️
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Instructor Panel
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Edit Course
              </h1>
            </div>

          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
            Update your course information, description, and thumbnail
            to keep your course content fresh and professional.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-8 py-6">
              <h2 className="text-lg font-bold text-slate-900">
                Course Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the details of your course.
              </p>
            </div>
            <div className="space-y-7 p-8">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Course Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Use a clear and descriptive title.
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
                  rows={7}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Keep the description informative and easy to understand.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Course Thumbnail
                </label>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <div className="relative h-56 w-full bg-slate-100">

                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="New course thumbnail"
                        className="h-full w-full object-cover"
                      />
                    ) : thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt="Current course thumbnail"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-slate-400">
                        <ImagePlus size={40} />
                        <p className="mt-2 text-sm">
                          No thumbnail
                        </p>
                      </div>
                    )}
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={removeNewThumbnail}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition hover:bg-red-50 hover:text-red-600"
                        title="Remove selected image"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  <div className="border-t border-slate-200 p-5">

                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600">
                      <ImagePlus size={18} />

                      {thumbnail
                        ? "Choose Different Thumbnail"
                        : "Change Thumbnail"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>

                    {thumbnail ? (
                      <p className="mt-3 text-center text-xs font-medium text-green-600">
                        ✓ New thumbnail selected: {thumbnail.name}
                      </p>
                    ) : (
                      <p className="mt-3 text-center text-xs text-slate-400">
                        Select a new image only if you want to change
                        the current thumbnail.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = "/instructor/courses")
                  }
                  disabled={updating}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updating}
                  className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating
                    ? "Updating..."
                    : "Update Course"}
                </button>

              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                💡
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Editing Tips
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <span className="text-blue-600">✓</span>
                  <p className="text-sm leading-5 text-slate-500">
                    Keep your course title short and specific.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600">✓</span>

                  <p className="text-sm leading-5 text-slate-500">
                    Explain what students can expect to learn.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-blue-600">✓</span>

                  <p className="text-sm leading-5 text-slate-500">
                    Use a clear and attractive course thumbnail.
                  </p>
                </div>

              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Course Status
              </p>

              <div className="mt-4 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Course Available
                  </p>

                  <p className="text-xs text-slate-400">
                    You can update course details anytime.
                  </p>
                </div>

              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Quick Preview
                </p>
              </div>

              <div className="h-36 bg-slate-100">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Course preview"
                    className="h-full w-full object-cover"
                  />
                ) : thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt="Course preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl">
                    📚
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                  {title || "Course Title"}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                  {description || "Course description"}
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}