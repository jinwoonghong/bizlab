import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/papers" className="text-xl font-bold text-indigo-600">
              BizLab
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/papers"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Papers
              </Link>
              <Link
                href="/papers/new"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Register New
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile navigation */}
        <nav className="flex sm:hidden items-center gap-4 pb-3">
          <Link
            href="/papers"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Papers
          </Link>
          <Link
            href="/papers/new"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Register New
          </Link>
        </nav>
      </div>
    </header>
  );
}
