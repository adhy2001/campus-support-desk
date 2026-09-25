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
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500 text-sm mt-1">SLA breaches, category breakdown, and staff workload</p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Total tickets" value={tickets.length} loading={loading} />
        <Stat label="SLA breaches" value={overdue.length} tone="red" loading={loading} />
        <Stat label="Unassigned (open)" value={unassignedCount} tone="orange" loading={loading} />
        <Stat label="Resolved" value={tickets.filter((t) => t.status === 'RESOLVED').length} tone="green" loading={loading} />
      </div>

      {/* Auto-escalation alert */}
      {escalated.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-600 text-xl mt-0.5">🚨</span>
          <div>
            <div className="font-semibold text-red-800 text-sm">
              {escalated.length} ticket{escalated.length > 1 ? 's' : ''} require{escalated.length === 1 ? 's' : ''} immediate attention
            </div>
            <div className="text-red-600 text-xs mt-1">
              These tickets are urgent, unassigned, and overdue — or manually escalated.
            </div>
          </div>
        </div>
      )}

      {/* Charts / breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* By category */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-lg">📁</span> Tickets by Category
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([k, v]) => {
                  const max = Math.max(...Object.values(byCategory))
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{CATEGORY_LABELS[k] || k}</span>
                        <span className="font-semibold text-slate-800">{v}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-400 rounded-full transition-all"
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-lg">👤</span> Staff Workload
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : Object.keys(byStaff).length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4 italic">No assignments yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(byStaff)
                .sort(([, a], [, b]) => b - a)
                .map(([k, v]) => {
                  const max = Math.max(...Object.values(byStaff))
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{k}</span>
                        <span className="font-semibold text-slate-800">{v} tickets</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm md:col-span-2">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-lg">📊</span> Status Breakdown
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {['OPEN', 'IN_PROGRESS', 'PENDING_STUDENT', 'ESCALATED', 'RESOLVED', 'CLOSED'].map((s) => (
              <div key={s} className="text-center bg-slate-50 border border-slate-100 rounded-lg p-3">
                <div className="text-xl font-bold text-slate-800">{statusBreakdown[s] || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{s.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLA breach report */}
      <div>
        <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <span className="text-red-600">⏰</span> SLA Breach Report
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : overdue.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-emerald-700">
            <div className="text-3xl mb-2">🎉</div>
            <div className="font-semibold">No overdue tickets</div>
            <div className="text-sm mt-1 text-emerald-600">All tickets are within their SLA windows.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {overdue.map((t) => (
              <Link
                key={t.id}
                href={`/tickets/${t.id}`}
                className="group block bg-white border border-red-200 rounded-xl p-4 hover:shadow-md hover:border-red-400 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
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
                  <span>📁 {CATEGORY_LABELS[t.category] || t.category}</span>
                  <span>👤 {t.assignedTo?.name || 'Unassigned'}</span>
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
      ? 'text-red-600 bg-red-50 border-red-200'
      : tone === 'orange'
      ? 'text-orange-600 bg-orange-50 border-orange-200'
      : tone === 'green'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : 'text-slate-800 bg-white border-slate-200'

  return (
    <div className={`border rounded-xl p-4 shadow-sm ${toneClass}`}>
      {loading ? (
        <div className="h-7 bg-slate-200 rounded animate-pulse w-12 mb-1" />
      ) : (
        <div className={`text-3xl font-extrabold`}>{value}</div>
      )}
      <div className="text-xs font-medium mt-1 opacity-70">{label}</div>
    </div>
  )
}
