import React from 'react'
import { STATUS, COMMISSION } from '../lib/constants'

export function LogoMark({ className = 'w-9 h-9' }) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden="true">
      <rect width="140" height="140" rx="32" fill="#1E3A8A" />
      <path d="M38 122 V72 A32 32 0 0 1 102 72 V122" fill="none" stroke="#FEF3C7" strokeWidth="14" strokeLinecap="round" />
      <circle cx="70" cy="92" r="12" fill="#F59E0B" />
      <path d="M47 118 L60 98 L70 108 L80 98 L93 118 Z" fill="#FEF3C7" />
    </svg>
  )
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: 'bg-slate-100 text-slate-600' }
  return <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${s.cls}`}>{s.label}</span>
}

export function CommissionBadge({ status }) {
  const c = COMMISSION[status] || COMMISSION.none
  if (status === 'none' || !status) return <span className={c.cls}>—</span>
  return <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${c.cls}`}>{c.label}</span>
}

export function Card({ className = '', children }) {
  return <div className={`bg-white rounded-2xl border border-brand-100 ${className}`}>{children}</div>
}

export function Stat({ label, value, hint, accent }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight ${accent ? 'text-apricot-600' : 'text-brand-900'}`}>{value}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </Card>
  )
}

export function PageTitle({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export const inputCls =
  'w-full px-3.5 py-2.5 bg-white border-2 border-brand-100 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-500'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50'

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-brand-100 hover:border-brand-300 text-brand-800 text-sm font-semibold rounded-xl transition disabled:opacity-50'

export function ErrorBox({ error }) {
  if (!error) return null
  return <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
}

export function Empty({ children }) {
  return <div className="p-10 text-center text-slate-500">{children}</div>
}
