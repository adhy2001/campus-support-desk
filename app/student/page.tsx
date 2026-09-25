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
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">My Requests</h1>
        <p className="text-slate-500 text-sm mt-1">Raise and track your support tickets</p>
      </div>

      {/* User selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
          {currentStudent?.name?.[0] || '?'}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-1">Logged in as</label>
          <select
            className="border border-slate-200 rounded-lg px-3 py-1.5 w-full text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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

      {/* New ticket form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="font-bold text-slate-800 text-lg mb-4">Raise a new ticket</h2>

        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
            <span>✅</span> Ticket submitted successfully!
          </div>
        )}

        <form onSubmit={submitTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Title</label>
            <input
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              placeholder="Brief summary of your issue"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"
              placeholder="Describe your issue in detail…"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Priority</label>
              <select
                className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
          >
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </form>
      </div>

      {/* Ticket list */}
      <div>
        <h2 className="font-bold text-slate-800 text-lg mb-4">
          Your Tickets
          {tickets.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">({tickets.length})</span>
          )}
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">No tickets yet</p>
            <p className="text-sm mt-1">Use the form above to raise your first request.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => (
              <Link
                key={t.id}
                href={`/tickets/${t.id}`}
                className="group block bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                    {t.title}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <OverdueBadge overdue={t.overdue} />
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    📁 {CATEGORY_LABELS[t.category] || t.category}
                  </span>
                  <span>
                    🕒 {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
