import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { Card, PageTitle, ErrorBox, inputCls, btnPrimary, btnSecondary } from '../components/ui'

const blank = { id: '', code: '', name: '', region: '', commission_rate: 4 }

export default function Universities() {
  const { universities, reloadUniversities } = useAdmin()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')

  async function add(e) {
    e.preventDefault()
    setError('')
    const row = { ...form, id: form.id.trim().toLowerCase(), commission_rate: Number(form.commission_rate) }
    const { error } = await supabase.from('universities').insert(row)
    if (error) return setError(error.message)
    setForm(blank); setAdding(false); reloadUniversities()
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Universitetlar"
        subtitle="Hamkor universitetlar va ular bilan kelishilgan ulush foizi"
        action={<button className={btnPrimary} onClick={() => setAdding(!adding)}><Plus className="w-4 h-4" /> Qo'shish</button>}
      />

      {adding && (
        <Card className="p-5">
          <form onSubmit={add} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <In label="ID (lotin, masalan: tdiu-andijan)" v={form.id} on={(v) => setForm({ ...form, id: v })} />
            <In label="Qisqa nom (kod)" v={form.code} on={(v) => setForm({ ...form, code: v })} />
            <In label="To'liq nomi" v={form.name} on={(v) => setForm({ ...form, name: v })} />
            <In label="Viloyat" v={form.region} on={(v) => setForm({ ...form, region: v })} req={false} />
            <In label="Ulush, %" type="number" v={form.commission_rate} on={(v) => setForm({ ...form, commission_rate: v })} />
            <div className="sm:col-span-2 lg:col-span-5"><ErrorBox error={error} /></div>
            <button className={`${btnPrimary} lg:col-start-5`}>Saqlash</button>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {universities.map((u) => <UniRow key={u.id} u={u} onSaved={reloadUniversities} />)}
      </div>
    </div>
  )
}

function UniRow({ u, onSaved }) {
  const [rate, setRate] = useState(String(Number(u.commission_rate)))
  const [contact, setContact] = useState(u.contact_name || '')
  const [phone, setPhone] = useState(u.contact_phone || '')
  const [msg, setMsg] = useState('')
  const dirty = rate !== String(Number(u.commission_rate)) || contact !== (u.contact_name || '') || phone !== (u.contact_phone || '')

  async function save(patch) {
    setMsg('')
    const { error } = await supabase.from('universities').update(patch).eq('id', u.id)
    setMsg(error ? error.message : 'Saqlandi')
    if (!error) onSaved()
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="lg:w-72">
          <p className="text-xs font-semibold text-slate-500">{u.code} · {u.region}</p>
          <p className="text-lg font-bold text-brand-900">{u.name}</p>
          <p className="text-sm text-slate-500">{(u.programs || []).length} ta yo'nalish</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <In label="Ulush, %" type="number" v={rate} on={setRate} />
          <In label="Mas'ul shaxs" v={contact} on={setContact} req={false} />
          <In label="Telefon" v={phone} on={setPhone} req={false} />
        </div>
        <div className="flex gap-2">
          <button
            disabled={!dirty}
            onClick={() => save({ commission_rate: Number(rate), contact_name: contact || null, contact_phone: phone || null })}
            className={btnPrimary}
          >
            Saqlash
          </button>
          <button onClick={() => save({ is_active: !u.is_active })} className={btnSecondary}>
            {u.is_active ? 'Yashirish' : 'Faollashtirish'}
          </button>
        </div>
      </div>
      {!u.is_active && <p className="mt-3 text-sm font-semibold text-apricot-700">Saytda ko'rinmaydi</p>}
      {msg && <p className={`mt-2 text-sm ${msg === 'Saqlandi' ? 'text-emerald-700' : 'text-red-600'}`}>{msg}</p>}
      <p className="mt-2 text-xs text-slate-500">Foizni o'zgartirish faqat yangi "To'lov qildi" holatlariga ta'sir qiladi. Avvalgilari o'zgarmaydi.</p>
    </Card>
  )
}

function In({ label, v, on, type = 'text', req = true }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-brand-900 mb-1">{label}</span>
      <input type={type} step={type === 'number' ? '0.1' : undefined} required={req} className={inputCls} value={v} onChange={(e) => on(e.target.value)} />
    </label>
  )
}
