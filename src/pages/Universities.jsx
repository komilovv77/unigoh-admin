import React, { useState } from 'react'
import { Plus, ChevronRight, MapPin, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { useApplications, useTerms } from '../lib/data'
import { mln } from '../lib/constants'
import { Card, PageTitle, ErrorBox, inputCls, btnPrimary } from '../components/ui'
import { go } from '../components/Shell'

const blank = { id: '', code: '', name: '', region: '' }

export default function Universities() {
  const { universities, reloadUniversities, isMaster } = useAdmin()
  const { apps, ledger } = useApplications({ isMaster })
  const { terms } = useTerms(isMaster)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  async function add(e) {
    e.preventDefault()
    setError('')
    const id = form.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const { error } = await supabase.from('universities').insert({ ...form, id, details: {}, programs: [] })
    if (error) return setError(error.message)
    setForm(blank); setAdding(false)
    await reloadUniversities()
    go('university', { id })
  }

  const list = universities.filter((u) => !q || `${u.name} ${u.code} ${u.region}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-6">
      <PageTitle
        title="Universitetlar"
        subtitle="Universitetni tanlang: talabalari, ma'lumotlari va hisob-kitobi"
        action={<button className={btnPrimary} onClick={() => setAdding(!adding)}><Plus className="w-4 h-4" /> Universitet qo'shish</button>}
      />

      {adding && (
        <Card className="p-5">
          <form onSubmit={add} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <In label="ID (lotincha, masalan: tdiu-andijan)" v={form.id} on={(v) => setForm({ ...form, id: v })} />
            <In label="Qisqa nom (kod)" v={form.code} on={(v) => setForm({ ...form, code: v })} />
            <In label="To'liq nomi" v={form.name} on={(v) => setForm({ ...form, name: v })} />
            <In label="Viloyat" v={form.region} on={(v) => setForm({ ...form, region: v })} />
            <div className="sm:col-span-2 lg:col-span-4"><ErrorBox error={error} /></div>
            <button className={`${btnPrimary} lg:col-start-4`}>Qo'shish va ochish</button>
          </form>
        </Card>
      )}

      <input className={inputCls} placeholder="Universitet qidirish..." value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((u) => {
          const mine = apps.filter((a) => a.university_id === u.id)
          const enrolled = mine.filter((a) => a.status === 'ENROLLED').length
          const money = mine.reduce((s, a) => s + Number(ledger[a.id]?.amount || 0), 0)
          return (
            <button
              key={u.id}
              onClick={() => go('university', { id: u.id })}
              className="text-left bg-white rounded-2xl border border-brand-100 hover:border-brand-300 p-5 transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{u.code}</p>
                  <p className="text-lg font-bold text-brand-900 group-hover:text-brand-700">{u.name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-slate-500"><MapPin className="w-3.5 h-3.5" /> {u.region || '—'}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-brand-300 group-hover:text-brand-700 shrink-0 mt-1" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Mini k="Ariza" v={mine.length} />
                <Mini k="O'qishga kirdi" v={enrolled} />
                <Mini k={`Ulush ${terms[u.id] ? Number(terms[u.id].commission_rate) + '%' : ''}`} v={mln(money)} accent />
              </div>
              {!u.is_active && <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-apricot-700"><EyeOff className="w-3.5 h-3.5" /> Saytda yashirin</p>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Mini({ k, v, accent }) {
  return (
    <div className="rounded-xl bg-cream px-2 py-2.5">
      <p className={`text-lg font-extrabold ${accent ? 'text-apricot-700' : 'text-brand-900'}`}>{v}</p>
      <p className="text-[11px] text-slate-500 leading-tight">{k}</p>
    </div>
  )
}

function In({ label, v, on }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-brand-900 mb-1">{label}</span>
      <input required className={inputCls} value={v} onChange={(e) => on(e.target.value)} />
    </label>
  )
}
