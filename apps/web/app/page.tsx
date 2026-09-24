import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 font-semibold text-gray-600">
            Welcome to LearnHub 🎓
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Learn. Grow. Succeed.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Discover quality courses, learn new skills, and build your
            knowledge with LearnHub.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/courses"
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Browse Courses
            </Link>

            <Link
              href="/signup"
              className="rounded-lg border bg-white px-6 py-3 font-semibold hover:bg-gray-100"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
<section className="px-6 py-16">
  <div className="mx-auto max-w-7xl">
    <div className="text-center">
      <h2 className="text-3xl font-bold">
        Everything You Need to Learn
      </h2>

      <p className="mt-3 text-gray-600">
        A simple platform to help you learn and grow.
      </p>
    </div>

    <div className="mt-10 grid gap-6 md:grid-cols-3">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-4xl">📚</div>

        <h3 className="mt-4 text-xl font-semibold">
          Quality Courses
        </h3>

        <p className="mt-2 text-gray-600">
          Learn through structured and engaging courses.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-4xl">🎯</div>

        <h3 className="mt-4 text-xl font-semibold">
          Learn at Your Pace
        </h3>

        <p className="mt-2 text-gray-600">
          Learn whenever and wherever it is convenient for you.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-4xl">🚀</div>

        <h3 className="mt-4 text-xl font-semibold">
          Track Your Progress
        </h3>

        <p className="mt-2 text-gray-600">
          Track your completed lessons and learning progress.
        </p>
      </div>
    </div>
  </div>
</section>

{/* Popular Courses Section */}
<section className="bg-gray-50 px-6 py-16">
  <div className="mx-auto max-w-7xl">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold">
          Popular Courses
        </h2>

        <p className="mt-2 text-gray-600">
          Start learning something new today.
        </p>
      </div>

      <Link
        href="/courses"
        className="font-semibold hover:underline"
      >
        View All →
      </Link>
    </div>

    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {/* Course 1 */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex h-40 items-center justify-center bg-gray-200 text-5xl">
          💻
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold">
            Web Development
          </h3>

          <p className="mt-2 text-gray-600">
            Learn HTML, CSS, JavaScript and modern web development.
          </p>

          <button className="mt-5 w-full rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800">
            View Course
          </button>
        </div>
      </div>

      {/* Course 2 */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex h-40 items-center justify-center bg-gray-200 text-5xl">
          ⚛️
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold">
            React Development
          </h3>

          <p className="mt-2 text-gray-600">
            Build modern and interactive applications with React.
          </p>

          <button className="mt-5 w-full rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800">
            View Course
          </button>
        </div>
      </div>

      {/* Course 3 */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex h-40 items-center justify-center bg-gray-200 text-5xl">
          🗄️
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold">
            Database Fundamentals
          </h3>

          <p className="mt-2 text-gray-600">
            Understand databases, SQL and data management.
          </p>

          <button className="mt-5 w-full rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800">
            View Course
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

{/* CTA Section */}
<section className="px-6 py-20">
  <div className="mx-auto max-w-4xl rounded-2xl bg-black px-6 py-12 text-center text-white">
    <h2 className="text-3xl font-bold sm:text-4xl">
      Ready to Start Learning?
    </h2>

    <p className="mx-auto mt-4 max-w-2xl text-gray-300">
      Join LearnHub today and start building new skills through
      practical and engaging courses.
    </p>

    <Link
      href="/signup"
      className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
    >
      Create Your Account
    </Link>
  </div>
</section>
    </main>
  );
}