"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries[0]?.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        show
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-10 scale-95 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white">
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">

          <Reveal>
            <p className="font-semibold text-blue-600">
              Welcome to LearnHub 🎓
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
              Learn. Grow.
              <span className="text-blue-600"> Succeed.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Discover quality courses, build practical skills and track your
              learning journey with LearnHub.
            </p>

            <div className="mt-8 flex justify-center gap-4">

              <Link
                href="/courses"
                className="rounded-lg bg-black px-6 py-3 font-semibold text-white shadow-md transition hover:-translate-y-1 hover:bg-gray-800 hover:shadow-lg"
              >
                Browse Courses
              </Link>

              <Link
                href="/signup"
                className="rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold shadow-sm transition hover:-translate-y-1 hover:bg-gray-50"
              >
                Get Started
              </Link>

            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500">
              <span>✓ Beginner Friendly</span>
              <span>✓ Structured Learning</span>
              <span>✓ Progress Tracking</span>
            </div>
          </Reveal>

        </div>
      </section>
      <Reveal>
        <section className="border-y bg-white px-6 py-10">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center md:grid-cols-4">

            <div>
              <h3 className="text-3xl font-bold text-gray-900">
                10K+
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Active Students
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900">
                50+
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Quality Courses
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900">
                95%
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Completion Rate
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900">
                4.8/5
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Student Rating
              </p>
            </div>

          </div>
        </section>
      </Reveal>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">

          <Reveal>
            <div className="text-center">

              <p className="text-sm font-semibold tracking-wide text-blue-600">
                WHY LEARNHUB
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Everything You Need to Learn
              </h2>

              <p className="mt-3 text-gray-500">
                Simple tools designed to make your learning journey easier.
              </p>

            </div>
          </Reveal>


          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Reveal>
              <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-3xl">
                  📚
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  Quality Courses
                </h3>

                <p className="mt-2 leading-7 text-gray-500">
                  Learn through structured and engaging courses designed for
                  practical learning.
                </p>

              </div>
            </Reveal>
            <Reveal>
              <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 text-3xl">
                  🎯
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  Learn at Your Pace
                </h3>

                <p className="mt-2 leading-7 text-gray-500">
                  Study whenever you want and continue learning at your own
                  comfortable pace.
                </p>

              </div>
            </Reveal>
            <Reveal>
              <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-3xl">
                  📈
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  Track Your Progress
                </h3>

                <p className="mt-2 leading-7 text-gray-500">
                  Monitor completed lessons and keep track of your learning
                  progress.
                </p>

              </div>
            </Reveal>

          </div>
        </div>
      </section>
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">

          <Reveal>
            <div className="flex items-end justify-between">

              <div>
                <p className="text-sm font-semibold tracking-wide text-blue-600">
                  FEATURED COURSES
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  Popular Courses
                </h2>

                <p className="mt-2 text-gray-500">
                  Learn skills that help you grow and build your career.
                </p>
              </div>

              <Link
                href="/courses"
                className="hidden text-sm font-semibold text-gray-700 transition hover:text-blue-600 sm:block"
              >
                View All →
              </Link>

            </div>
          </Reveal>


          <div className="mt-10 grid gap-7 md:grid-cols-3">

            
            <Reveal>
              <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">

                <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white text-6xl">

                  <span className="transition duration-300 group-hover:scale-110">
                    💻
                  </span>

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm">
                    Beginner
                  </span>

                </div>

                <div className="p-6">

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-500">
                      ★★★★★
                    </span>

                    <span className="text-sm text-gray-500">
                      4.8
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-gray-900">
                    Web Development
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Learn HTML, CSS, JavaScript and modern web development.
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <span>👥 2.4K learners</span>
                    <span>12 Lessons</span>
                  </div>

                </div>
              </div>
            </Reveal>


           
            <Reveal>
              <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">

                <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-white text-6xl">

                  <span className="transition duration-300 group-hover:scale-110">
                    ⚛️
                  </span>

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-600 shadow-sm">
                    Intermediate
                  </span>

                </div>

                <div className="p-6">

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-500">
                      ★★★★★
                    </span>

                    <span className="text-sm text-gray-500">
                      4.9
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-gray-900">
                    React Development
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Build modern and interactive applications with React.
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <span>👥 1.8K learners</span>
                    <span>15 Lessons</span>
                  </div>

                </div>
              </div>
            </Reveal>


            
            <Reveal>
              <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">

                <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-emerald-100 via-green-50 to-white text-6xl">

                  <span className="transition duration-300 group-hover:scale-110">
                    🗄️
                  </span>

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm">
                    Beginner
                  </span>

                </div>

                <div className="p-6">

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-500">
                      ★★★★★
                    </span>

                    <span className="text-sm text-gray-500">
                      4.7
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-gray-900">
                    Database Fundamentals
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Understand databases, SQL and essential data management.
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <span>👥 1.2K learners</span>
                    <span>10 Lessons</span>
                  </div>

                </div>
              </div>
            </Reveal>

          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/courses"
              className="font-semibold text-gray-700 hover:text-blue-600"
            >
              View All Courses →
            </Link>
          </div>

        </div>
      </section>
      <section className="px-6 py-20">

        <Reveal>
          <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-14 text-center text-white shadow-xl">

            <p className="text-sm font-semibold tracking-wide text-blue-100">
              START YOUR LEARNING JOURNEY
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Ready to Start Learning? 🚀
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-blue-100">
              Build practical skills, complete lessons and take your knowledge
              to the next level with LearnHub.
            </p>

            <Link
              href="/signup"
              className="mt-7 inline-block rounded-xl bg-white px-7 py-3 font-semibold text-gray-900 shadow-lg transition hover:-translate-y-1 hover:bg-gray-100"
            >
              Create Your Account →
            </Link>

          </div>
        </Reveal>

      </section>

    </main>
  );
}