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
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 px-6 py-4 bg-brand-900 text-white rounded-xl text-sm font-bold shadow-premium animate-in slide-in-from-right flex items-center gap-3">
          <span>ℹ️</span> {toast}
        </div>
      )}

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-950 tracking-tight">Staff Dashboard</h1>
          <p className="text-slate-500 text-base mt-2">Manage, assign, and resolve student tickets</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-semibold bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 appearance-none min-w-[200px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">📁 All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Active</div>
            <div className="text-3xl font-extrabold text-brand-950">{tickets.length}</div>
          </div>
          <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-xl">📋</div>
        </div>
        <div className="bg-white border border-red-100 shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-red-500 uppercase tracking-wider mb-1">Overdue</div>
            <div className="text-3xl font-extrabold text-red-700">{overdueCount}</div>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-xl">⏰</div>
        </div>
        <div className="bg-white border border-accent-100 shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-accent-500 uppercase tracking-wider mb-1">Escalated</div>
            <div className="text-3xl font-extrabold text-accent-700">{escalatedCount}</div>
          </div>
          <div className="w-12 h-12 bg-accent-50 rounded-full flex items-center justify-center text-xl">🚨</div>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
          {STATUS_COLUMNS.map((col) => (
            <div key={col} className="bg-slate-50 rounded-3xl p-4 w-80 shrink-0 snap-start animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x min-h-[600px] items-start scrollbar-hide">
          {STATUS_COLUMNS.map((col) => {
            const colTickets = tickets.filter((t) => t.status === col)
            return (
              <div key={col} className={`rounded-3xl border-2 ${STATUS_COLUMN_COLORS[col]} bg-slate-50/50 p-4 w-80 shrink-0 snap-start flex flex-col max-h-[80vh]`}>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider mb-4 flex items-center justify-between ${STATUS_HEADER_COLORS[col]} px-2 pt-2`}>
                  <span>{STATUS_LABELS[col]}</span>
                  <span className="bg-white rounded-full px-3 py-1 shadow-sm text-xs">{colTickets.length}</span>
                </h3>
                
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-2">
                  {colTickets.map((t) => (
                    <div key={t.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-300">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <OverdueBadge overdue={t.overdue} />
                        <PriorityBadge priority={t.priority} />
                        {t.autoEscalate && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-600 text-white tracking-widest uppercase shadow-sm">
                            Auto↑
                          </span>
                        )}
                      </div>
                      
                      <Link
                        href={`/tickets/${t.id}`}
                        className="font-bold text-slate-800 text-base leading-snug hover:text-brand-600 transition-colors line-clamp-2 block mb-2"
                      >
                        {t.title}
                      </Link>
                      
                      <div className="text-xs font-medium text-slate-400 mb-4 flex flex-wrap items-center gap-1.5">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">📁 {CATEGORY_LABELS[t.category] || t.category}</span>
                        <span>· {t.ageHours}h · {t.createdBy.name}</span>
                      </div>
                      
                      <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                        <select
                          className="text-xs font-semibold border-2 border-slate-100 rounded-xl px-3 py-2 w-full bg-slate-50 hover:bg-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                          value={t.assignedTo?.id || ''}
                          onChange={(e) => assign(t.id, e.target.value)}
                        >
                          <option value="">👤 Unassigned</option>
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <select
                            className="text-xs font-semibold border-2 border-slate-100 rounded-xl px-3 py-2 flex-1 bg-slate-50 hover:bg-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                            value=""
                            onChange={(e) => e.target.value && changeStatus(t.id, e.target.value)}
                          >
                            <option value="">Move To...</option>
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
                              className="text-xs font-bold border-2 border-red-100 bg-red-50 text-red-600 rounded-xl px-3 py-2 hover:bg-red-600 hover:text-white transition-all shadow-sm w-12 flex items-center justify-center"
                            >
                              ↑
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTickets.length === 0 && (
                    <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400">
                      <p className="text-sm font-medium">Empty column</p>
                    </div>
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
