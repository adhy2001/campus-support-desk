'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="text-7xl mb-6">⚠️</div>
      <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Something went wrong</h1>
      <p className="text-slate-500 text-sm mb-2 max-w-sm">
        {error.message || 'An unexpected error occurred.'}
      </p>
      {error.digest && (
        <p className="text-xs text-slate-400 mb-6 font-mono">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-colors shadow-sm"
        >
          Try again
        </button>
        <Link
          href="/"
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-5 py-2.5 font-semibold text-sm transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
