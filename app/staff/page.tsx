'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { StatusBadge, PriorityBadge, OverdueBadge } from '@/components/Badges'

type User = { id: string; name: string; role: string }
type Ticket = {
  id: string
  title: string
  category: string
  status: string
  priority: string
  overdue: boolean
  autoEscalate: boolean
  ageHours: number
  assignedTo: { id: string; name: string } | null
  createdBy: { id: string; name: string }
}

const STATUS_COLUMNS = ['OPEN', 'IN_PROGRESS', 'PENDING_STUDENT', 'ESCALATED', 'RESOLVED', 'CLOSED']
const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  PENDING_STUDENT: 'Pending Student',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}
const STATUS_COLUMN_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-50 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 border-amber-200',
  PENDING_STUDENT: 'bg-purple-50 border-purple-200',
  ESCALATED: 'bg-red-50 border-red-200',
  RESOLVED: 'bg-emerald-50 border-emerald-200',
  CLOSED: 'bg-slate-100 border-slate-200',
}
const STATUS_HEADER_COLORS: Record<string, string> = {
  OPEN: 'text-blue-700',
  IN_PROGRESS: 'text-amber-700',
  PENDING_STUDENT: 'text-purple-700',
  ESCALATED: 'text-red-700',
  RESOLVED: 'text-emerald-700',
  CLOSED: 'text-slate-500',
}

const CATEGORY_LABELS: Record<string, string> = {
  FEES: 'Fees',
  ATTENDANCE: 'Attendance',
  ID_CARD: 'ID Card',
  DOCUMENTS: 'Documents',
  CERTIFICATES: 'Certificates',
  OTHER: 'Other',
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<User[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(() => {
    setLoading(true)
    const qs = categoryFilter ? `?category=${categoryFilter}` : ''
    fetch(`/api/tickets${qs}`)
      .then((r) => r.json())
      .then((data) => {
        setTickets(data)
        setLoading(false)
      })
  }, [categoryFilter])

  useEffect(() => {
    fetch('/api/users?role=STAFF')
      .then((r) => r.json())
      .then(setStaffList)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function assign(ticketId: string, assignedToId: string) {
    await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedToId: assignedToId || null }),
    })
    load()
  }

  async function changeStatus(ticketId: string, status: string) {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const err = await res.json()
      showToast(err.error || 'Could not update status')
    } else {
      showToast(`Ticket moved to ${STATUS_LABELS[status]}`)
    }
    load()
  }

  async function escalate(ticketId: string) {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escalate: true }),
    })
    if (res.ok) showToast('Ticket escalated')
    else showToast('Could not escalate ticket')
    load()
  }

  const overdueCount = tickets.filter((t) => t.overdue).length
  const escalatedCount = tickets.filter((t) => t.autoEscalate || t.status === 'ESCALATED').length

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 px-4 py-3 bg-slate-800 text-white rounded-xl text-sm shadow-lg animate-in slide-in-from-right">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Staff Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Kanban view — assign, move, and resolve tickets</p>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
          <span className="text-slate-500">Total</span>
          <span className="font-bold text-slate-800">{tickets.length}</span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 flex items-center gap-2">
          <span>⏰ Overdue</span>
          <span className="font-bold">{overdueCount}</span>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-sm text-orange-700 flex items-center gap-2">
          <span>🚨 Escalated</span>
          <span className="font-bold">{escalatedCount}</span>
        </div>
        <div className="ml-auto">
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATUS_COLUMNS.map((col) => (
            <div key={col} className="bg-slate-100 rounded-xl p-3 h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {STATUS_COLUMNS.map((col) => {
            const colTickets = tickets.filter((t) => t.status === col)
            return (
              <div key={col} className={`rounded-xl border ${STATUS_COLUMN_COLORS[col]} p-3 min-h-[80px]`}>
                <h3 className={`text-xs font-bold uppercase tracking-wide mb-3 flex items-center justify-between ${STATUS_HEADER_COLORS[col]}`}>
                  <span>{STATUS_LABELS[col]}</span>
                  <span className="bg-white/70 rounded-full px-2 py-0.5 text-xs">{colTickets.length}</span>
                </h3>
                <div className="space-y-2">
                  {colTickets.map((t) => (
                    <div key={t.id} className="bg-white rounded-lg p-3 border border-white shadow-sm hover:shadow-md transition-shadow">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="font-semibold text-slate-800 text-sm hover:text-indigo-700 transition-colors line-clamp-2 block"
                      >
                        {t.title}
                      </Link>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <OverdueBadge overdue={t.overdue} />
                        <PriorityBadge priority={t.priority} />
                        {t.autoEscalate && (
                          <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                            AUTO↑
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        {CATEGORY_LABELS[t.category] || t.category} · {t.ageHours}h · {t.createdBy.name}
                      </div>
                      <div className="flex flex-col gap-1.5 mt-3">
                        <select
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 w-full bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          value={t.assignedTo?.id || ''}
                          onChange={(e) => assign(t.id, e.target.value)}
                        >
                          <option value="">⬜ Unassigned</option>
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              👤 {s.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1">
                          <select
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 flex-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            value=""
                            onChange={(e) => e.target.value && changeStatus(t.id, e.target.value)}
                          >
                            <option value="">Move →</option>
                            {STATUS_COLUMNS.filter((s) => s !== t.status).map((s) => (
                              <option key={s} value={s}>
                                {STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                          {!['RESOLVED', 'CLOSED', 'ESCALATED'].includes(t.status) && (
                            <button
                              onClick={() => escalate(t.id)}
                              title="Escalate ticket"
                              className="text-xs border border-red-200 bg-red-50 text-red-700 rounded-lg px-2 py-1.5 hover:bg-red-100 transition-colors font-semibold"
                            >
                              ↑
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTickets.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4 italic">Empty</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
