'use client'

import { useEffect, useState, useCallback, use } from 'react'
import Link from 'next/link'
import { StatusBadge, PriorityBadge, OverdueBadge } from '@/components/Badges'

type Comment = { id: string; message: string; createdAt: string; author: { name: string; role: string } }
type Activity = { id: string; action: string; detail: string; createdAt: string }
type TicketDetail = {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  overdue: boolean
  autoEscalate: boolean
  slaDueAt: string
  createdAt: string
  createdBy: { name: string; email: string }
  assignedTo: { name: string; email: string } | null
  comments: Comment[]
  activity: Activity[]
}

type User = { id: string; name: string; role: string }

const ACTION_ICONS: Record<string, string> = {
  CREATED: '🎫',
  ASSIGNED: '👤',
  STATUS_CHANGED: '🔄',
  PRIORITY_CHANGED: '⚡',
  ESCALATED: '🚨',
  COMMENT_ADDED: '💬',
}

const CATEGORY_LABELS: Record<string, string> = {
  FEES: 'Fees',
  ATTENDANCE: 'Attendance',
  ID_CARD: 'ID Card',
  DOCUMENTS: 'Documents',
  CERTIFICATES: 'Certificates',
  OTHER: 'Other',
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [message, setMessage] = useState('')
  const [posting, setPosting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [authorId, setAuthorId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch(`/api/tickets/${id}`)
      .then((r) => r.json())
      .then(setTicket)
  }, [id])

  useEffect(() => {
    load()
    // Load all users (staff + student) so commenter can be selected
    Promise.all([
      fetch('/api/users?role=STAFF').then((r) => r.json()),
      fetch('/api/users?role=STUDENT').then((r) => r.json()),
    ]).then(([staff, students]) => {
      const all: User[] = [...staff, ...students]
      setUsers(all)
      if (staff.length) setAuthorId(staff[0].id)
    })
  }, [load])

  async function postComment(e: React.FormEvent) {
    e.preventDefault()
    if (!message || !authorId) return
    setPosting(true)
    setError(null)
    const res = await fetch(`/api/tickets/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId, message }),
    })
    if (!res.ok) {
      const err = await res.json()
      setError(err.error || 'Failed to post comment')
    } else {
      setMessage('')
      load()
    }
    setPosting(false)
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-6">
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-3/4" />
          <div className="h-48 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if ('error' in ticket) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Ticket Not Found</h1>
        <p className="text-slate-500 mb-6">The ticket you are looking for does not exist or has been removed.</p>
        <Link href="/staff" className="text-indigo-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const slaDate = new Date(ticket.slaDueAt)
  const slaExpired = slaDate < new Date() && !['RESOLVED', 'CLOSED'].includes(ticket.status)
  const slaLabel = slaDate.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8">
        <Link href="/staff" className="text-sm font-bold text-slate-400 hover:text-brand-600 transition-colors flex items-center gap-2 inline-flex bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm hover:shadow-md">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Ticket header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-500"></div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-extrabold text-brand-950 leading-tight">{ticket.title}</h1>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <OverdueBadge overdue={ticket.overdue} />
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed text-base mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">{ticket.description}</p>

        {ticket.autoEscalate && (
          <div className="mb-6 px-6 py-4 rounded-2xl bg-red-50 border-2 border-red-100 text-red-700 text-sm font-bold flex items-center gap-3 shadow-sm">
            <span className="text-xl">🚨</span> This ticket requires immediate attention — auto-escalation triggered.
          </div>
        )}

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 text-sm">
          {[
            { label: 'Category', value: CATEGORY_LABELS[ticket.category] || ticket.category },
            { label: 'Raised by', value: ticket.createdBy.name },
            { label: 'Assigned to', value: ticket.assignedTo?.name || 'Unassigned' },
            { label: 'Created', value: new Date(ticket.createdAt).toLocaleDateString('en-IN') },
            {
              label: 'SLA due',
              value: slaLabel,
              extra: slaExpired ? <span className="ml-2 text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm">BREACHED</span> : null,
            },
          ].map(({ label, value, extra }) => (
            <div key={label} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</dt>
              <dd className="text-slate-800 font-bold flex flex-wrap items-center gap-2">
                {value}
                {extra}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Comments */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium md:col-span-2">
          <h2 className="font-bold text-brand-950 text-xl mb-6 flex items-center gap-3">
            <span className="bg-brand-50 w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-brand-100">💬</span> 
            Comments ({ticket.comments.length})
          </h2>
          <div className="space-y-4 mb-8">
            {ticket.comments.length === 0 && (
              <div className="text-sm font-medium text-slate-400 text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                No comments yet. Be the first to respond.
              </div>
            )}
            {ticket.comments.map((c) => (
              <div key={c.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 flex-shrink-0 mt-1">
                  {c.author.name[0]}
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-base font-bold text-brand-950">{c.author.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">{c.author.role}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{c.message}</p>
                  <div className="text-xs font-medium text-slate-400">
                    {new Date(c.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={postComment} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Commenting as
              </label>
              <select
                className="border-2 border-slate-200 rounded-xl px-4 py-2.5 w-full text-sm font-medium bg-white hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all appearance-none"
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="border-2 border-slate-200 rounded-xl px-4 py-3 flex-1 text-sm bg-white hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                placeholder="Add a comment…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button
                disabled={posting}
                className="bg-accent-500 hover:bg-accent-600 text-white rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-50 transition-all shadow-md hover:shadow-lg sm:w-auto w-full"
              >
                {posting ? '…' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>

        {/* Activity log */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium">
          <h2 className="font-bold text-brand-950 text-xl mb-6 flex items-center gap-3">
            <span className="bg-slate-100 w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-slate-200">📋</span> 
            Activity
          </h2>
          <div className="relative pt-2 pl-2">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-6 bottom-4 w-0.5 bg-slate-100 rounded-full" />
            <ul className="space-y-6">
              {ticket.activity.map((a) => (
                <li key={a.id} className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-white border-[3px] border-slate-100 shadow-sm flex items-center justify-center text-xs flex-shrink-0 z-10">
                    {ACTION_ICONS[a.action] || '•'}
                  </div>
                  <div className="flex-1 pt-1 pb-2">
                    <div className="text-sm font-bold text-slate-800 leading-tight">
                      {a.action.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium leading-relaxed bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 inline-block mt-2">
                      {a.detail}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                      {new Date(a.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
