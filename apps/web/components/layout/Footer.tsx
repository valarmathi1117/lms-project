export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-xl font-bold">LearnHub</h2>
            <p className="mt-1 text-sm text-gray-500">
              Learn. Grow. Succeed.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            © 2026 LearnHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}