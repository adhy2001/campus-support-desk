'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatusBadge, PriorityBadge, OverdueBadge } from '@/components/Badges'

type Ticket = {
  id: string
  title: string
  category: string
  status: string
  priority: string
  overdue: boolean
  autoEscalate: boolean
  createdAt: string
  assignedTo: { id: string; name: string } | null
}

const CATEGORY_LABELS: Record<string, string> = {
  FEES: 'Fees',
  ATTENDANCE: 'Attendance',
  ID_CARD: 'ID Card',
  DOCUMENTS: 'Documents',
  CERTIFICATES: 'Certificates',
  OTHER: 'Other',
}

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((data) => {
        setTickets(data)
        setLoading(false)
      })
  }, [])

  const overdue = tickets.filter((t) => t.overdue)
  const escalated = tickets.filter((t) => t.autoEscalate || t.status === 'ESCALATED')
  const byCategory = groupCount(tickets, (t) => t.category)
  const byStaff = groupCount(
    tickets.filter((t) => t.assignedTo),
    (t) => t.assignedTo!.name
  )
  const unassignedCount = tickets.filter(
    (t) => !t.assignedTo && !['RESOLVED', 'CLOSED'].includes(t.status)
  ).length

  const statusBreakdown: Record<string, number> = {}
  for (const t of tickets) {
    statusBreakdown[t.status] = (statusBreakdown[t.status] || 0) + 1
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-brand-950 tracking-tight">Admin Overview</h1>
        <p className="text-slate-500 text-lg mt-2">SLA breaches, category breakdown, and staff workload</p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
        <Stat label="Total tickets" value={tickets.length} loading={loading} />
        <Stat label="SLA breaches" value={overdue.length} tone="red" loading={loading} />
        <Stat label="Unassigned (open)" value={unassignedCount} tone="orange" loading={loading} />
        <Stat label="Resolved" value={tickets.filter((t) => t.status === 'RESOLVED').length} tone="green" loading={loading} />
      </div>

      {/* Auto-escalation alert */}
      {escalated.length > 0 && (
        <div className="mb-8 bg-red-50 border border-red-200 shadow-sm rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
            🚨
          </div>
          <div>
            <div className="font-bold text-red-700 text-lg">
              {escalated.length} ticket{escalated.length > 1 ? 's' : ''} require{escalated.length === 1 ? 's' : ''} immediate attention
            </div>
            <div className="text-red-600 text-sm mt-1 font-medium">
              These tickets are urgent, unassigned, and overdue — or manually escalated.
            </div>
          </div>
        </div>
      )}

      {/* Charts / breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* By category */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium">
          <h2 className="font-bold text-brand-950 text-xl mb-6 flex items-center gap-3">
            <span className="bg-brand-50 w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-brand-100">📁</span> 
            Tickets by Category
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([k, v]) => {
                  const max = Math.max(...Object.values(byCategory))
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-slate-700">{CATEGORY_LABELS[k] || k}</span>
                        <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{v}</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all"
                          style={{ width: `${(v / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Staff workload */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium">
          <h2 className="font-bold text-brand-950 text-xl mb-6 flex items-center gap-3">
            <span className="bg-accent-50 w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-accent-100">👤</span> 
            Staff Workload
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : Object.keys(byStaff).length === 0 ? (
            <div className="py-10 text-center">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-slate-400 font-medium">No assignments yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(byStaff)
                .sort(([, a], [, b]) => b - a)
                .map(([k, v]) => {
                  const max = Math.max(...Object.values(byStaff))
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-slate-700">{k}</span>
                        <span className="font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-md">{v} tickets</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className="h-full bg-accent-500 rounded-full transition-all"
                          style={{ width: `${(v / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium md:col-span-2">
          <h2 className="font-bold text-brand-950 text-xl mb-6 flex items-center gap-3">
            <span className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-emerald-100">📊</span> 
            Status Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['OPEN', 'IN_PROGRESS', 'PENDING_STUDENT', 'ESCALATED', 'RESOLVED', 'CLOSED'].map((s) => (
              <div key={s} className="text-center bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                <div className="text-3xl font-extrabold text-brand-950 mb-1">{statusBreakdown[s] || 0}</div>
                <div className="text-xs font-bold text-slate-500 tracking-wider">{s.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLA breach report */}
      <div>
        <h2 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-2">
          <span className="text-red-600">⏰</span> SLA Breach Report
        </h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : overdue.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 shadow-sm rounded-3xl p-12 text-center text-emerald-700">
            <div className="text-5xl mb-4">🎉</div>
            <div className="font-extrabold text-xl">No overdue tickets</div>
            <div className="text-base mt-2 text-emerald-600 font-medium">All tickets are within their SLA windows. Great job!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdue.map((t) => (
              <Link
                key={t.id}
                href={`/tickets/${t.id}`}
                className="group bg-white border border-red-200 rounded-2xl p-6 hover:shadow-premium hover:border-red-400 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 text-lg group-hover:text-brand-700 transition-colors block mb-2 leading-tight">
                      {t.title}
                    </span>
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-3">
                      <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">📁 {CATEGORY_LABELS[t.category] || t.category}</span>
                      <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">👤 {t.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-start sm:items-end flex-shrink-0 mt-2 sm:mt-0">
                    <OverdueBadge overdue={t.overdue} />
                    <div className="flex gap-1.5">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function groupCount<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  return items.reduce((acc, item) => {
    const key = keyFn(item)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function Stat({
  label,
  value,
  tone,
  loading,
}: {
  label: string
  value: number
  tone?: 'red' | 'orange' | 'green'
  loading?: boolean
}) {
  const toneClass =
    tone === 'red'
      ? 'text-red-700 bg-red-50 border-red-100 shadow-sm'
      : tone === 'orange'
      ? 'text-accent-700 bg-accent-50 border-accent-100 shadow-sm'
      : tone === 'green'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-100 shadow-sm'
      : 'text-brand-900 bg-white border-slate-100 shadow-premium'

  const valueColor = 
    tone === 'red' ? 'text-red-700' :
    tone === 'orange' ? 'text-accent-600' :
    tone === 'green' ? 'text-emerald-600' :
    'text-brand-600'

  return (
    <div className={`border-2 rounded-3xl p-6 ${toneClass} transition-all hover:scale-[1.02]`}>
      {loading ? (
        <div className="h-8 bg-black/5 rounded animate-pulse w-16 mb-2" />
      ) : (
        <div className={`text-4xl font-extrabold ${valueColor}`}>{value}</div>
      )}
      <div className="text-xs font-bold uppercase tracking-wider mt-2 opacity-80">{label}</div>
    </div>
  )
}
