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
        <header className="bg-brand-950 text-white shadow-premium sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 font-bold text-lg hover:text-accent-500 transition-colors">
              <span className="bg-accent-500 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">🎓</span>
              <span className="tracking-tight">Campus Support</span>
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/student" className="px-4 py-2 rounded-full text-brand-100 hover:bg-brand-800 hover:text-white transition-all font-medium hover:scale-105">Student</Link>
              <Link href="/staff" className="px-4 py-2 rounded-full text-brand-100 hover:bg-brand-800 hover:text-white transition-all font-medium hover:scale-105">Staff</Link>
              <Link href="/admin" className="px-4 py-2 rounded-full bg-accent-500 text-white hover:bg-accent-600 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5">Admin</Link>
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

