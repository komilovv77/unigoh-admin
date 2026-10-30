// Ariza jarayoni bosqichlari (bazadagi applications.status bilan bir xil)
export const STATUSES = [
  { value: 'NEW',         label: 'Yangi',                  cls: 'bg-slate-100 text-slate-700' },
  { value: 'DOCS_REVIEW', label: 'Hujjatlar tekshiruvda',  cls: 'bg-brand-50 text-brand-700' },
  { value: 'EXAM',        label: 'Imtihonga chaqirildi',   cls: 'bg-violet-50 text-violet-700' },
  { value: 'ADMITTED',    label: 'Qabul qilindi',          cls: 'bg-sky-50 text-sky-700' },
  { value: 'CONTRACT',    label: 'Shartnoma tuzildi',      cls: 'bg-apricot-100 text-apricot-800' },
  { value: 'ENROLLED',    label: "To'lov qildi",           cls: 'bg-emerald-50 text-emerald-700' },
  { value: 'REJECTED',    label: 'Rad etildi',             cls: 'bg-red-50 text-red-700' },
  { value: 'WITHDRAWN',   label: 'Voz kechdi',             cls: 'bg-slate-100 text-slate-500' },
]

export const STATUS = Object.fromEntries(STATUSES.map((s) => [s.value, s]))

// Voronka uchun: shu bosqichga yetgan yoki undan o'tganlar
export const FUNNEL = ['NEW', 'DOCS_REVIEW', 'EXAM', 'ADMITTED', 'CONTRACT', 'ENROLLED']
export const ACTIVE = ['NEW', 'DOCS_REVIEW', 'EXAM', 'ADMITTED', 'CONTRACT']

export const COMMISSION = {
  none:     { label: '—',               cls: 'text-slate-400' },
  pending:  { label: 'Kutilmoqda',      cls: 'bg-apricot-100 text-apricot-800' },
  invoiced: { label: 'Hisob yuborildi', cls: 'bg-brand-50 text-brand-700' },
  paid:     { label: "To'landi",        cls: 'bg-emerald-50 text-emerald-700' },
}

const nf = new Intl.NumberFormat('ru-RU')
export const money = (n) => (n == null ? '—' : `${nf.format(Math.round(n))} so'm`)
export const mln = (n) => `${(Number(n || 0) / 1_000_000).toFixed(1).replace('.', ',')} mln`

export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
export const date = (d) =>
  d ? new Date(d).toLocaleDateString('ru-RU', { timeZone: 'Asia/Tashkent' }) : '—'

export function toCsv(rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return '﻿' + rows.map((r) => r.map(esc).join(';')).join('\n')
}

export function downloadCsv(name, rows) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}
