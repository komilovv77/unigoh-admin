import React, { useState } from 'react'
import { Pencil } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { inputCls } from './ui'

// Xodim ismini joyida o'zgartirish (faqat bosh admin)
export default function NameEdit({ user, name, onSaved }) {
  const [edit, setEdit] = useState(false)
  const [val, setVal] = useState(name || '')
  const [err, setErr] = useState('')

  async function save(e) {
    e.preventDefault()
    const { error } = await supabase.rpc('set_staff_name', { p_user: user, p_full_name: val })
    if (error) return setErr(error.message)
    setErr(''); setEdit(false); onSaved?.()
  }

  if (!edit) {
    return (
      <button type="button" onClick={() => { setVal(name || ''); setEdit(true) }} className="group inline-flex items-center gap-1.5 font-semibold text-brand-900 text-left">
        {name || 'Ism kiritilmagan'}
        <Pencil className="w-3.5 h-3.5 text-brand-300 group-hover:text-brand-700" />
      </button>
    )
  }
  return (
    <form onSubmit={save} className="flex flex-wrap items-center gap-2">
      <input autoFocus required className={`${inputCls} !py-1.5 max-w-56`} value={val} onChange={(e) => setVal(e.target.value)} />
      <button className="text-sm font-semibold text-brand-700 hover:text-brand-900">Saqlash</button>
      <button type="button" onClick={() => setEdit(false)} className="text-sm text-slate-500">Bekor</button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </form>
  )
}
