'use client'

import { useEffect, useState, useCallback } from 'react'
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

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [message, setMessage] = useState('')
  const [posting, setPosting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [authorId, setAuthorId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch(`/api/tickets/${params.id}`)
      .then((r) => r.json())
      .then(setTicket)
  }, [params.id])

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
    const res = await fetch(`/api/tickets/${params.id}/comments`, {
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

  const slaDate = new Date(ticket.slaDueAt)
  const slaExpired = slaDate < new Date() && !['RESOLVED', 'CLOSED'].includes(ticket.status)
  const slaLabel = slaDate.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <div className="mb-6">
        <Link href="/staff" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
          ← Back to Staff Dashboard
        </Link>
      </div>

      {/* Ticket header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{ticket.title}</h1>
          <div className="flex gap-1.5 flex-shrink-0">
            <OverdueBadge overdue={ticket.overdue} />
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm mb-5">{ticket.description}</p>

        {ticket.autoEscalate && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
            <span>🚨</span> This ticket requires immediate attention — auto-escalation triggered.
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[
            { label: 'Category', value: CATEGORY_LABELS[ticket.category] || ticket.category },
            { label: 'Raised by', value: ticket.createdBy.name },
            { label: 'Assigned to', value: ticket.assignedTo?.name || 'Unassigned' },
            { label: 'Created', value: new Date(ticket.createdAt).toLocaleString('en-IN') },
            {
              label: 'SLA due',
              value: slaLabel,
              extra: slaExpired ? <span className="ml-2 text-xs font-bold text-red-600">BREACHED</span> : null,
            },
          ].map(({ label, value, extra }) => (
            <div key={label}>
              <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</dt>
              <dd className="text-slate-700 mt-0.5 font-medium flex items-center">
                {value}
                {extra}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Comments */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
        <h2 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <span>💬</span> Comments ({ticket.comments.length})
        </h2>
        <div className="space-y-3 mb-5">
          {ticket.comments.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4 italic">No comments yet. Be the first to respond.</p>
          )}
          {ticket.comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0 mt-0.5">
                {c.author.name[0]}
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-700">{c.author.name}</span>
                  <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{c.author.role}</span>
                </div>
                <p className="text-sm text-slate-600">{c.message}</p>
                <div className="text-xs text-slate-400 mt-2">
                  {new Date(c.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={postComment} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Commenting as
            </label>
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          <div className="flex gap-2">
            <input
              className="border border-slate-200 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              placeholder="Add a comment…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <button
              disabled={posting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
            >
              {posting ? '…' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Activity log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <span>📋</span> Activity Log
        </h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200" />
          <ul className="space-y-4">
            {ticket.activity.map((a) => (
              <li key={a.id} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-sm flex-shrink-0 z-10">
                  {ACTION_ICONS[a.action] || '•'}
                </div>
                <div className="flex-1 pb-0.5">
                  <span className="text-sm font-semibold text-slate-700">
                    {a.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-slate-500"> — {a.detail}</span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {new Date(a.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
