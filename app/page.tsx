import Link from 'next/link'

const ROLES = [
  {
    href: '/student',
    emoji: '📋',
    title: 'Student Portal',
    description: 'Raise new support requests, track your ticket status, and view your history.',
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    textColor: 'text-indigo-700',
  },
  {
    href: '/staff',
    emoji: '🛠️',
    title: 'Staff Dashboard',
    description: 'Kanban board to manage, assign, and resolve tickets with SLA tracking.',
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-700',
  },
  {
    href: '/admin',
    emoji: '📊',
    title: 'Admin Overview',
    description: 'SLA breach reports, category breakdown, and staff workload metrics.',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
  },
]

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
          <span>✨</span>
          <span>Edumerge Campus Support Prototype</span>
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Campus Support Desk
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          A full-featured student support &amp; ticket management system with SLA tracking, auto-escalation, and a complete audit trail.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
        {ROLES.map((role) => (
          <Link
            key={role.href}
            href={role.href}
            className={`group relative rounded-2xl border ${role.border} ${role.bg} p-6 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-2xl shadow-sm`}>
              {role.emoji}
            </div>
            <div>
              <div className={`text-lg font-bold ${role.textColor}`}>{role.title}</div>
              <div className="text-sm text-slate-500 mt-1 leading-relaxed">{role.description}</div>
            </div>
            <div className={`text-sm font-semibold ${role.textColor} flex items-center gap-1 mt-auto group-hover:gap-2 transition-all`}>
              Enter <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          { icon: '⏱️', label: 'SLA Tracking', desc: 'Per-category deadlines' },
          { icon: '🚨', label: 'Auto-Escalation', desc: 'Urgent + overdue flags' },
          { icon: '🔒', label: 'State Machine', desc: 'Enforced transitions' },
          { icon: '📝', label: 'Audit Log', desc: 'Immutable activity trail' },
        ].map((f) => (
          <div key={f.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-sm font-semibold text-slate-700">{f.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
