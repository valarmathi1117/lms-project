"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    if (profile.role === "student") {
      window.location.href = "/student/dashboard";
    } else if (profile.role === "instructor") {
      window.location.href = "/instructor/dashboard";
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

       
        <div className="hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold">
                L
              </div>

              <span className="text-2xl font-bold">
                LearnHub
              </span>
            </div>

            <div className="mt-32 max-w-lg">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-400">
                Learning Management System
              </p>

              <h1 className="text-5xl font-bold leading-tight">
                Learn skills.
                <br />
                Build your future.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                Access professional courses, track your progress,
                and learn at your own pace with LearnHub.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            © 2026 LearnHub. All rights reserved.
          </p>
        </div>
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center justify-center gap-2 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                L
              </div>

              <span className="text-2xl font-bold text-slate-900">
                LearnHub
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">

              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to continue your learning journey.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email address
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password
                  </Label>

                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-11"
                  />
                </div>
                {message && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {message}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full bg-blue-600 font-semibold hover:bg-blue-700"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
              <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}