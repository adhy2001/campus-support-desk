import Link from 'next/link'

const ROLES = [
  {
    href: '/student',
    emoji: '📋',
    title: 'Student Portal',
    description: 'Raise new support requests, track your ticket status, and view your history.',
    btnColor: 'bg-accent-500 hover:bg-accent-600 text-white',
  },
  {
    href: '/staff',
    emoji: '🛠️',
    title: 'Staff Dashboard',
    description: 'Kanban board to manage, assign, and resolve tickets with SLA tracking.',
    btnColor: 'bg-brand-800 hover:bg-brand-900 text-white',
  },
  {
    href: '/admin',
    emoji: '📊',
    title: 'Admin Overview',
    description: 'SLA breach reports, category breakdown, and staff workload metrics.',
    btnColor: 'bg-brand-800 hover:bg-brand-900 text-white',
  },
]

export default function Home() {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Premium Hero Section */}
      <div className="bg-brand-950 pt-24 pb-48 px-6 relative overflow-hidden text-center">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500 blur-3xl"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-accent-500 blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-600 blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 text-brand-100 text-sm font-bold mb-10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-default hover:scale-105 hover:shadow-lg">
            <span className="text-accent-400 text-lg">✨</span>
            <span className="tracking-wide uppercase">Edumerge Campus Support Prototype</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]">
            Streamlined Support for <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">Campus Excellence</span>
          </h1>
          <p className="text-xl sm:text-2xl text-brand-100/90 max-w-3xl mx-auto leading-relaxed font-medium">
            A full-featured student support &amp; ticket management system with SLA tracking, auto-escalation, and a complete audit trail.
          </p>
        </div>
      </div>

      {/* Floating Role Cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-20 mb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ROLES.map((role) => (
            <div
              key={role.href}
              className="group bg-white rounded-3xl p-8 shadow-premium hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-4 hover:scale-[1.03] transition-all duration-500 border border-slate-100 flex flex-col h-full overflow-hidden relative cursor-pointer"
            >
              {/* Subtle gradient hover effect */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-400 via-accent-400 to-brand-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-3xl mb-6 shadow-sm border border-brand-100 text-brand-700 group-hover:scale-125 group-hover:-rotate-6 group-hover:bg-brand-100 transition-all duration-500">
                {role.emoji}
              </div>
              <h2 className="text-2xl font-extrabold text-brand-950 mb-4 group-hover:text-brand-600 transition-colors duration-300">{role.title}</h2>
              <p className="text-base text-slate-500 mb-10 leading-relaxed flex-grow group-hover:text-slate-700 transition-colors duration-300">
                {role.description}
              </p>
              <Link
                href={role.href}
                className={`w-full py-4 px-4 rounded-xl text-sm font-extrabold text-center transition-all duration-300 ${role.btnColor} shadow-md group-hover:shadow-xl group-hover:scale-[1.02] flex items-center justify-center gap-2`}
              >
                Access Portal
                <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Feature highlights */}
      <div className="max-w-6xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-brand-950 tracking-tight">Key Capabilities</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-accent-400 to-accent-600 mx-auto mt-6 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '⏱️', label: 'SLA Tracking', desc: 'Per-category deadlines and automated breach detection.' },
            { icon: '🚨', label: 'Auto-Escalation', desc: 'Urgent + overdue flags trigger immediate attention alerts.' },
            { icon: '🔒', label: 'State Machine', desc: 'Enforced status transitions ensure proper resolution flows.' },
            { icon: '📝', label: 'Audit Log', desc: 'Immutable activity trail for every single action and change.' },
          ].map((f) => (
            <div key={f.label} className="group bg-white border-2 border-slate-100 rounded-3xl p-8 hover:border-brand-200 hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mb-6 group-hover:bg-brand-50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm border border-slate-100">
                {f.icon}
              </div>
              <div className="text-xl font-bold text-brand-950 mb-3 group-hover:text-brand-700 transition-colors duration-300">{f.label}</div>
              <div className="text-sm font-medium text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors duration-300">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
