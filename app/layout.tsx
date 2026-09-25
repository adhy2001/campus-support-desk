import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Campus Support Desk',
  description: 'Student Support & Ticket Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 font-['Inter',system-ui,sans-serif]">
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-800 hover:text-indigo-600 transition-colors">
              <span className="text-indigo-600 text-xl">🎓</span>
              <span>Campus Support Desk</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/student" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium">Student</Link>
              <Link href="/staff" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium">Staff</Link>
              <Link href="/admin" className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </body>
    </html>
  )
}

