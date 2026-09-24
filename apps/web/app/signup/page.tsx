"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        full_name: fullName,
        role: role,
      });

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    setMessage("Account created successfully! You can now login.");

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
                Start your learning journey
              </p>

              <h1 className="text-5xl font-bold leading-tight">
                Learn.
                <br />
                Grow.
                <br />
                Succeed.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                Join LearnHub and gain access to professional
                courses designed to help you build real-world skills.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            © 2026 LearnHub. All rights reserved.
          </p>
        </div>
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
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
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Join LearnHub and start learning today.
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full name
                  </Label>

                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="h-11"
                  />
                </div>
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
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className="h-11"
                  />

                  <p className="text-xs text-slate-500">
                    Password must contain at least 6 characters.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>
                    Choose your role
                  </Label>

                  <div className="grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`rounded-xl border p-4 text-left transition ${
                        role === "student"
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xl">🎓</div>

                      <p className="mt-2 font-semibold text-slate-900">
                        Student
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Learn and track progress
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("instructor")}
                      className={`rounded-xl border p-4 text-left transition ${
                        role === "instructor"
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xl">👨‍🏫</div>

                      <p className="mt-2 font-semibold text-slate-900">
                        Instructor
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Create and manage courses
                      </p>
                    </button>

                  </div>
                </div>
                {message && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    {message}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full bg-blue-600 font-semibold hover:bg-blue-700"
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
              <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Sign in
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