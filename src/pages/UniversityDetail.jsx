import React, { useEffect, useState } from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { useApplications, useTerms } from '../lib/data'
import { ACTIVE, COMMISSION, money, mln } from '../lib/constants'
import { Card, Stat, ErrorBox, inputCls, btnPrimary, btnSecondary } from '../components/ui'
import AppTable from '../components/AppTable'
import { go } from '../components/Shell'

export default function UniversityDetail({ params }) {
  const { isMaster, staff, uniById } = useAdmin()
  const id = isMaster ? params.get('id') : staff.university_id
  const u = uniById[id]
  const [tab, setTab] = useState(params.get('tab') || 'students')
  const data = useApplications({ isMaster, universityId: id })

  if (!u) return <p className="text-slate-500">Universitet topilmadi.</p>

  const total = data.apps.length
  const active = data.apps.filter((a) => ACTIVE.includes(a.status)).length
  const enrolled = data.apps.filter((a) => a.status === 'ENROLLED').length
  const TABS = [
    { id: 'students', label: 'Talabalar va arizalar' },
    { id: 'info', label: "Ma'lumotlar va yo'nalishlar" },
    ...(isMaster ? [{ id: 'terms', label: 'Kelishuv va moliya' }] : []),
  ]

  return (
    <div className="space-y-6">
      <div>
        {isMaster && (
          <button onClick={() => go('universities')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900 mb-3">
            <ArrowLeft className="w-4 h-4" /> Universitetlar
          </button>
        )}
        <p className="text-sm font-semibold text-slate-500">{u.code} · {u.region}</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">{u.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Arizalar" value={total} />
        <Stat label="Jarayonda" value={active} />
        <Stat label="O'qishga kirdi" value={enrolled} />
      </div>

      <div className="flex gap-1 p-1.5 bg-white border border-brand-100 rounded-2xl overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition ${tab === t.id ? 'bg-brand-800 text-white' : 'text-brand-800 hover:bg-brand-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <ErrorBox error={data.error} />
      {tab === 'students' && <AppTable data={data} initialQuery={params.get('q') || ''} />}
      {tab === 'info' && <InfoEditor u={u} editable={isMaster} />}
      {tab === 'terms' && isMaster && <Terms u={u} ledger={data.ledger} />}
    </div>
  )
}

const DETAIL_FIELDS = [
  ['shortDescription', 'Qisqa tavsif (saytda ko\'rinadi)', 'textarea'],
  ['grantOpportunity', 'Grant imkoniyati', 'text'],
  ['applicationDeadline', 'Ariza muddati', 'date'],
  ['city', 'Manzil', 'text'],
  ['website', 'Veb-sayt', 'url'],
  ['phone', 'Qabul telefoni', 'text'],
  ['email', 'Qabul emaili', 'email'],
]

function InfoEditor({ u, editable }) {
  const { reloadUniversities } = useAdmin()
  const [base, setBase] = useState({ name: u.name, code: u.code, region: u.region || '', is_active: u.is_active })
  const [details, setDetails] = useState(u.details || {})
  const [programs, setPrograms] = useState(u.programs || [])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBase({ name: u.name, code: u.code, region: u.region || '', is_active: u.is_active })
    setDetails(u.details || {})
    setPrograms(u.programs || [])
  }, [u])

  const setP = (i, k, v) => setPrograms(programs.map((p, j) => (j === i ? { ...p, [k]: k === 'tuition' ? (v === '' ? '' : Number(v)) : v } : p)))

  async function save() {
    setSaving(true); setMsg(''); setErr('')
    const clean = programs
      .filter((p) => p.name?.trim())
      .map((p, i) => ({ ...p, id: p.id || `${u.id}-${Date.now().toString(36)}-${i}`, tuition: Number(p.tuition) || null }))
    const { error } = await supabase.from('universities').update({ ...base, details, programs: clean }).eq('id', u.id)
    setSaving(false)
    if (error) return setErr(error.message)
    setMsg('Saqlandi. Saytda darhol yangilanadi.')
    reloadUniversities()
  }

  const dis = !editable
  return (
    <div className="space-y-6">
      {!editable && <p className="text-sm text-slate-600">Bu ma'lumotlarni o'zgartirish kerak bo'lsa, UniGoh administratoriga yozing.</p>}
      <Card className="p-5 space-y-4">
        <h2 className="text-lg font-bold text-brand-900">Asosiy ma'lumotlar</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <L t="To'liq nomi"><input disabled={dis} className={inputCls} value={base.name} onChange={(e) => setBase({ ...base, name: e.target.value })} /></L>
          <L t="Qisqa nom"><input disabled={dis} className={inputCls} value={base.code} onChange={(e) => setBase({ ...base, code: e.target.value })} /></L>
          <L t="Viloyat"><input disabled={dis} className={inputCls} value={base.region} onChange={(e) => setBase({ ...base, region: e.target.value })} /></L>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {DETAIL_FIELDS.map(([k, label, type]) => (
            <L key={k} t={label} wide={type === 'textarea'}>
              {type === 'textarea'
                ? <textarea disabled={dis} rows={2} className={inputCls} value={details[k] || ''} onChange={(e) => setDetails({ ...details, [k]: e.target.value })} />
                : <input disabled={dis} type={type} className={inputCls} value={details[k] || ''} onChange={(e) => setDetails({ ...details, [k]: e.target.value })} />}
            </L>
          ))}
        </div>
        {editable && (
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" className="w-4 h-4 accent-blue-800" checked={base.is_active} onChange={(e) => setBase({ ...base, is_active: e.target.checked })} />
            Saytda ko'rsatilsin (talabalar ariza bera oladi)
          </label>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-900">Yo'nalishlar va narxlar</h2>
          {editable && (
            <button onClick={() => setPrograms([...programs, { name: '', degree: 'Bakalavr', duration: '4 yil', tuition: '' }])} className={btnSecondary}>
              <Plus className="w-4 h-4" /> Yo'nalish
            </button>
          )}
        </div>
        {programs.length === 0 && <p className="text-sm text-slate-500">Yo'nalishlar qo'shilmagan. Talabalar ariza berishi uchun kamida bittasi kerak.</p>}
        <div className="space-y-2">
          {programs.map((p, i) => (
            <div key={p.id || i} className="grid grid-cols-2 sm:grid-cols-[1fr_120px_100px_160px_auto] gap-2 items-center">
              <input disabled={dis} className={`${inputCls} col-span-2 sm:col-span-1`} placeholder="Yo'nalish nomi" value={p.name || ''} onChange={(e) => setP(i, 'name', e.target.value)} />
              <input disabled={dis} className={inputCls} placeholder="Daraja" value={p.degree || ''} onChange={(e) => setP(i, 'degree', e.target.value)} />
              <input disabled={dis} className={inputCls} placeholder="Muddat" value={p.duration || ''} onChange={(e) => setP(i, 'duration', e.target.value)} />
              <input disabled={dis} className={inputCls} inputMode="numeric" placeholder="Yillik narx, so'm" value={p.tuition ?? ''} onChange={(e) => setP(i, 'tuition', e.target.value.replace(/\D/g, ''))} />
              {editable
                ? <button onClick={() => setPrograms(programs.filter((_, j) => j !== i))} aria-label="O'chirish" className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl justify-self-start"><Trash2 className="w-4 h-4" /></button>
                : <span />}
            </div>
          ))}
        </div>
      </Card>

      {editable && (
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className={btnPrimary}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
          {msg && <span className="text-sm font-semibold text-emerald-700">{msg}</span>}
          <ErrorBox error={err} />
        </div>
      )}
    </div>
  )
}

function Terms({ u, ledger }) {
  const { terms, reload } = useTerms(true)
  const t = terms[u.id] || {}
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setForm({ commission_rate: t.commission_rate ?? 4, contact_name: t.contact_name || '', contact_phone: t.contact_phone || '', notes: t.notes || '' })
  }, [t.commission_rate, t.contact_name, t.contact_phone, t.notes])

  async function save(e) {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.from('university_terms').upsert({ university_id: u.id, ...form, commission_rate: Number(form.commission_rate) })
    setMsg(error ? error.message : 'Saqlandi')
    reload()
  }

  const rows = Object.values(ledger)
  const sum = (st) => rows.filter((r) => r.status === st).reduce((s, r) => s + Number(r.amount || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat label={COMMISSION.pending.label} value={mln(sum('pending'))} accent />
        <Stat label={COMMISSION.invoiced.label} value={mln(sum('invoiced'))} />
        <Stat label={COMMISSION.paid.label} value={mln(sum('paid'))} />
      </div>
      <Card className="p-5">
        <form onSubmit={save} className="space-y-4">
          <h2 className="text-lg font-bold text-brand-900">Kelishuv shartlari</h2>
          <p className="text-sm text-slate-600">Bu ma'lumotlar faqat sizga ko'rinadi. Universitet xodimlari ularni ko'rmaydi.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <L t="UniGoh ulushi, % (1-yil kontraktidan)"><input type="number" step="0.1" min="0" max="100" className={inputCls} value={form.commission_rate ?? ''} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} /></L>
            <L t="Mas'ul shaxs"><input className={inputCls} value={form.contact_name || ''} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></L>
            <L t="Telefon"><input className={inputCls} value={form.contact_phone || ''} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></L>
          </div>
          <L t="Izoh (shartnoma raqami, to'lov tartibi...)"><textarea rows={2} className={inputCls} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></L>
          <p className="text-xs text-slate-500">Foiz o'zgarsa, faqat bundan keyin o'qishga kirganlarga qo'llanadi.</p>
          <div className="flex items-center gap-3">
            <button className={btnPrimary}>Saqlash</button>
            {msg && <span className={`text-sm font-semibold ${msg === 'Saqlandi' ? 'text-emerald-700' : 'text-red-600'}`}>{msg}</span>}
          </div>
        </form>
      </Card>
      <p className="text-sm text-slate-600">Har bir talaba bo'yicha to'lovlar: <button className="font-semibold text-brand-700 underline" onClick={() => go('finance', { uni: u.id })}>Moliya bo'limi</button>. Jami: {money(rows.reduce((s, r) => s + Number(r.amount || 0), 0))}</p>
    </div>
  )
}

function L({ t, children, wide }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="block text-xs font-semibold text-brand-900 mb-1">{t}</span>
      {children}
    </label>
  )
}
