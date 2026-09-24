"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function Navbar() {
  const supabase = createClient();

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function getUserRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role ?? null);
      setLoading(false);
    }

    getUserRole();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="relative border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-2xl font-bold text-slate-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm text-white">
            L
          </div>

          LearnHub
        </Link>

       
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 top-full z-50 w-full flex-col gap-3 border-t border-slate-200 bg-white px-6 py-4 shadow-md md:static md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {!loading && !role && (
            <>
              <Link
                href="/"
                onClick={closeMenu}
                className="text-sm font-medium text-slate-600 hover:text-blue-600"
              >
                Home
              </Link>

              <Link
                href="/courses"
                onClick={closeMenu}
                className="text-sm font-medium text-slate-600 hover:text-blue-600"
              >
                Courses
              </Link>

              <Link
                href="/login"
                onClick={closeMenu}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Login
              </Link>

              <Link
                href="/signup"
                onClick={closeMenu}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}

          {!loading && role === "student" && (
            <>
              <Link
                href="/student/dashboard"
                onClick={closeMenu}
                className="text-sm font-medium text-slate-600 hover:text-blue-600"
              >
                Dashboard
              </Link>

              <Link
                href="/student/courses"
                onClick={closeMenu}
                className="text-sm font-medium text-slate-600 hover:text-blue-600"
              >
                My Courses
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          )}

          {!loading && role === "instructor" && (
            <>
              <Link
                href="/instructor/dashboard"
                onClick={closeMenu}
                className="text-sm font-medium text-slate-600 hover:text-blue-600"
              >
                Dashboard
              </Link>

              <Link
                href="/instructor/courses"
                onClick={closeMenu}
                className="text-sm font-medium text-slate-600 hover:text-blue-600"
              >
                My Courses
              </Link>

              <Link
                href="/instructor/courses/create"
                onClick={closeMenu}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Course
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          )}
        </div>

       
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}