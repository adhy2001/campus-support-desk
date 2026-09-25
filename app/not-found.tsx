'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="text-7xl mb-6">🎫</div>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Page not found</h1>
      <p className="text-slate-500 text-sm mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-semibold text-sm transition-colors shadow-sm"
      >
        Back to home
      </Link>
    </div>
  )
}
