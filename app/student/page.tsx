'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatusBadge, PriorityBadge, OverdueBadge } from '@/components/Badges'

const CATEGORIES = ['FEES', 'ATTENDANCE', 'ID_CARD', 'DOCUMENTS', 'CERTIFICATES', 'OTHER']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const CATEGORY_LABELS: Record<string, string> = {
  FEES: 'Fees',
  ATTENDANCE: 'Attendance',
  ID_CARD: 'ID Card',
  DOCUMENTS: 'Documents',
  CERTIFICATES: 'Certificates',
  OTHER: 'Other',
}

type User = { id: string; name: string; role: string }
type Ticket = {
  id: string
  title: string
  category: string
  status: string
  priority: string
  overdue: boolean
  createdAt: string
}

export default function StudentPage() {
  const [students, setStudents] = useState<User[]>([])
  const [studentId, setStudentId] = useState('')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [form, setForm] = useState({ title: '', description: '', category: 'OTHER', priority: 'MEDIUM' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users?role=STUDENT')
      .then((r) => r.json())
      .then((data: User[]) => {
        setStudents(data)
        if (data.length) setStudentId(data[0].id)
      })
  }, [])

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    fetch(`/api/tickets?createdById=${studentId}`)
      .then((r) => r.json())
      .then((data) => {
        setTickets(data)
        setLoading(false)
      })
  }, [studentId])

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId || !form.title || !form.description) return
    setSubmitting(true)
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, createdById: studentId }),
    })
    if (res.ok) {
      setForm({ title: '', description: '', category: 'OTHER', priority: 'MEDIUM' })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      const refreshed = await fetch(`/api/tickets?createdById=${studentId}`).then((r) => r.json())
      setTickets(refreshed)
    }
    setSubmitting(false)
  }

  const currentStudent = students.find((s) => s.id === studentId)

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-brand-950 tracking-tight">Student Portal</h1>
        <p className="text-slate-500 mt-2 text-lg">Raise and track your support tickets</p>
      </div>

      {/* User selector */}
      <div className="bg-white border border-slate-100 shadow-premium rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl flex-shrink-0 shadow-sm">
          {currentStudent?.name?.[0] || '?'}
        </div>
        <div className="flex-1 w-full text-center sm:text-left">
          <label className="block text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Logged in as</label>
          <select
            className="border-2 border-slate-100 rounded-xl px-4 py-3 w-full max-w-sm text-base text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all font-medium appearance-none"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* New ticket form */}
        <div className="md:col-span-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium sticky top-24">
            <h2 className="font-bold text-slate-900 text-xl mb-6">Raise new request</h2>

            {success && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold flex items-center gap-2 shadow-sm">
                <span>✅</span> Ticket submitted successfully!
              </div>
            )}

            <form onSubmit={submitTicket} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Title</label>
                <input
                  className="border-2 border-slate-100 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-slate-50 hover:bg-white transition-all"
                  placeholder="Brief summary of your issue"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Description</label>
                <textarea
                  className="border-2 border-slate-100 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-slate-50 hover:bg-white transition-all resize-none"
                  placeholder="Describe your issue in detail…"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Category</label>
                  <select
                    className="border-2 border-slate-100 rounded-xl px-3 py-3 w-full text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-slate-50 hover:bg-white transition-all font-medium appearance-none"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Priority</label>
                  <select
                    className="border-2 border-slate-100 rounded-xl px-3 py-3 w-full text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-slate-50 hover:bg-white transition-all font-medium appearance-none"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                disabled={submitting}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white rounded-xl px-4 py-3.5 text-base font-bold disabled:opacity-50 transition-all shadow-md hover:shadow-lg mt-2"
              >
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>

        {/* Ticket list */}
        <div className="md:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900 text-xl">
              Your History
            </h2>
            {tickets.length > 0 && (
              <span className="bg-brand-100 text-brand-700 py-1 px-3 rounded-full text-sm font-bold">
                {tickets.length} Tickets
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 animate-pulse shadow-sm">
                  <div className="h-5 bg-slate-200 rounded w-2/3 mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-12 text-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-slate-100">
                📭
              </div>
              <p className="font-bold text-slate-600 text-lg">No tickets yet</p>
              <p className="text-sm mt-2 max-w-xs mx-auto">Use the form to raise your first request. We're here to help!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/tickets/${t.id}`}
                  className="group block bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-premium-lg hover:border-brand-300 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className="font-bold text-slate-800 text-lg group-hover:text-brand-700 transition-colors block mb-2 leading-tight">
                        {t.title}
                      </span>
                      <div className="text-sm text-slate-500 flex items-center gap-4 font-medium">
                        <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          📁 {CATEGORY_LABELS[t.category] || t.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          🕒 {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 flex-shrink-0">
                      <StatusBadge status={t.status} />
                      <div className="flex gap-2 mt-1">
                        <OverdueBadge overdue={t.overdue} />
                        <PriorityBadge priority={t.priority} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
