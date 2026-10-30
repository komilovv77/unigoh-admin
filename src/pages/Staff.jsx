import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { Card, PageTitle, ErrorBox, Empty, inputCls, btnPrimary } from '../components/ui'
import { date } from '../lib/constants'

export default function Staff() {
  const { universities, uniById, session } = useAdmin()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('university_admin')
  const [uni, setUni] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('list_staff')
    if (error) setError(error.message)
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function assign(e) {
    e.preventDefault()
    setError(''); setOk('')
    const { error } = await supabase.rpc('assign_staff', { p_email: email, p_role: role, p_university: role === 'master' ? null : uni })
    if (error) return setError(error.message)
    setOk(`${email} biriktirildi. Hali ro'yxatdan o'tmagan bo'lsa, o'tishi bilan panel ochiladi.`)
    setEmail('')
    load()
  }

  async function resetMfa(id, mail) {
    if (!window.confirm(`${mail} ning ikki bosqichli himoyasi o'chirilsinmi? Keyingi kirishda u QR kodni qayta skanerlaydi.`)) return
    setError(''); setOk('')
    const { error } = await supabase.rpc('reset_staff_mfa', { p_user: id })
    if (error) setError(error.message)
    else setOk(`${mail}: ikki bosqichli himoya qayta o'rnatiladi`)
  }

  async function remove(id, mail) {
    if (!window.confirm(`${mail} ning panelga kirish huquqi olib tashlansinmi?`)) return
    const { error } = await supabase.rpc('remove_staff', { p_user: id })
    if (error) setError(error.message)
    else load()
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Xodimlar" subtitle="Admin panelga kim kira olishini boshqarish" />

      <Card className="p-5">
        <h2 className="font-bold text-brand-900">Xodim biriktirish</h2>
        <ol className="mt-2 text-sm text-slate-600 list-decimal pl-5 space-y-0.5">
          <li>Xodimning emailini yozib, rolini va universitetini tanlang.</li>
          <li>U admin panelda shu email bilan ro'yxatdan o'tadi (yoki allaqachon akkaunti bo'lsa, shunchaki kiradi).</li>
          <li>U qayta kirganda faqat o'z universiteti arizalarini ko'radi.</li>
        </ol>
        <form onSubmit={assign} className="mt-4 grid sm:grid-cols-[1fr_200px_1fr_auto] gap-3 items-end">
          <label>
            <span className="block text-xs font-semibold text-brand-900 mb-1">Email</span>
            <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <span className="block text-xs font-semibold text-brand-900 mb-1">Rol</span>
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="university_admin">Universitet admini</option>
              <option value="master">Bosh administrator</option>
            </select>
          </label>
          <label>
            <span className="block text-xs font-semibold text-brand-900 mb-1">Universitet</span>
            <select className={inputCls} required={role !== 'master'} disabled={role === 'master'} value={uni} onChange={(e) => setUni(e.target.value)}>
              <option value="">Tanlang</option>
              {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>
          <button className={btnPrimary}>Biriktirish</button>
        </form>
        <div className="mt-3"><ErrorBox error={error} /></div>
        {ok && <p className="mt-2 text-sm font-semibold text-emerald-700">{ok}</p>}
      </Card>

      <Card className="overflow-hidden">
        {loading ? <Empty>Yuklanmoqda...</Empty> : rows.length === 0 ? <Empty>Xodimlar yo'q</Empty> : (
          <table className="w-full text-sm">
            <thead className="bg-brand-50/60">
              <tr className="text-left text-brand-900">
                <th className="px-4 py-3 font-semibold">Xodim</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Qo'shilgan</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id} className="border-t border-brand-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-900">{r.full_name || '—'}</p>
                    <p className="text-xs text-slate-500">{r.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {r.role === 'master'
                      ? <span className="px-2.5 py-1 rounded-lg bg-apricot-100 text-apricot-800 text-xs font-semibold">Bosh administrator</span>
                      : <span className="text-slate-700">{uniById[r.university_id]?.name || r.university_id}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{date(r.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {r.user_id !== session.user.id && (
                      <span className="inline-flex flex-wrap justify-end gap-x-4 gap-y-1">
                        <button onClick={() => resetMfa(r.user_id, r.email)} className="text-sm font-semibold text-brand-700 hover:text-brand-900">2FA ni tiklash</button>
                        <button onClick={() => remove(r.user_id, r.email)} className="text-sm font-semibold text-red-600 hover:text-red-700">Olib tashlash</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
