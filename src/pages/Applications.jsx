import React, { useEffect, useMemo, useState } from 'react'
import { Search, AlertTriangle, X, Download, CheckCircle2, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { useApplications } from '../lib/data'
import { STATUSES, STATUS, COMMISSION, money, dateTime, date, downloadCsv } from '../lib/constants'
import { Card, PageTitle, StatusBadge, CommissionBadge, ErrorBox, Empty, inputCls, btnPrimary, btnSecondary } from '../components/ui'

export default function Applications({ params }) {
  const { isMaster, uniById, universities } = useAdmin()
  const { apps, profiles, flags, loading, error, reload } = useApplications()
  const [status, setStatus] = useState(params.get('status') || '')
  const [uni, setUni] = useState('')
  const [q, setQ] = useState('')
  const [onlyFlags, setOnlyFlags] = useState(params.get('flag') === '1')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    setStatus(params.get('status') || '')
    setOnlyFlags(params.get('flag') === '1')
  }, [params])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return apps.filter((a) => {
      if (status && a.status !== status) return false
      if (uni && a.university_id !== uni) return false
      if (onlyFlags && !flags[a.id]) return false
      if (!s) return true
      const p = profiles[a.student_id] || {}
      return [a.code, p.full_name, p.phone, a.program_name].some((v) => String(v || '').toLowerCase().includes(s))
    })
  }, [apps, profiles, flags, status, uni, q, onlyFlags])

  const open = apps.find((a) => a.id === openId)

  function exportCsv() {
    downloadCsv(`unigoh-arizalar-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Kod', 'Talaba', 'Telefon', 'Viloyat', 'Universitet', "Yo'nalish", 'Holat', 'Kontrakt', 'Komissiya', 'Sana'],
      ...list.map((a) => {
        const p = profiles[a.student_id] || {}
        return [a.code, p.full_name, p.phone, p.region, uniById[a.university_id]?.name, a.program_name,
          STATUS[a.status]?.label, a.contract_amount, a.commission_amount, date(a.created_at)]
      }),
    ])
  }

  return (
    <div>
      <PageTitle
        title="Arizalar"
        subtitle={`${list.length} ta ariza`}
        action={<button onClick={exportCsv} className={btnSecondary}><Download className="w-4 h-4" /> Excel (CSV)</button>}
      />

      <Card className="p-4 mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_200px_220px_auto]">
          <label className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input className={`${inputCls} pl-10`} placeholder="Ism, telefon yoki kod" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Barcha holatlar</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {isMaster ? (
            <select className={inputCls} value={uni} onChange={(e) => setUni(e.target.value)}>
              <option value="">Barcha universitetlar</option>
              {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          ) : <span className="hidden lg:block" />}
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-1">
            <input type="checkbox" checked={onlyFlags} onChange={(e) => setOnlyFlags(e.target.checked)} className="w-4 h-4 accent-amber-500" />
            Faqat ogohlantirishlar
          </label>
        </div>
      </Card>

      <ErrorBox error={error} />

      <Card className="overflow-hidden">
        {loading ? (
          <Empty>Yuklanmoqda...</Empty>
        ) : list.length === 0 ? (
          <Empty>Arizalar topilmadi</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50/60">
                <tr className="text-left text-brand-900">
                  <th className="px-4 py-3 font-semibold">Talaba</th>
                  {isMaster && <th className="px-4 py-3 font-semibold">Universitet</th>}
                  <th className="px-4 py-3 font-semibold">Yo'nalish</th>
                  <th className="px-4 py-3 font-semibold">Holat</th>
                  <th className="px-4 py-3 font-semibold text-right">Komissiya</th>
                  <th className="px-4 py-3 font-semibold">Sana</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => {
                  const p = profiles[a.student_id] || {}
                  return (
                    <tr key={a.id} onClick={() => setOpenId(a.id)} className="border-t border-brand-50 hover:bg-cream cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {flags[a.id] && <AlertTriangle className="w-4 h-4 text-apricot-600 shrink-0" aria-label={flags[a.id]} />}
                          <div>
                            <p className="font-semibold text-brand-900">{p.full_name || 'Ism kiritilmagan'}</p>
                            <p className="text-xs text-slate-500">{a.code} · {p.phone || '—'}</p>
                          </div>
                        </div>
                      </td>
                      {isMaster && <td className="px-4 py-3 text-slate-700">{uniById[a.university_id]?.code || a.university_id}</td>}
                      <td className="px-4 py-3 text-slate-700 max-w-56 truncate">{a.program_name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {a.status === 'ENROLLED' ? (
                          <div>
                            <p className="font-semibold text-apricot-700">{money(a.commission_amount)}</p>
                            <CommissionBadge status={a.commission_status} />
                          </div>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{date(a.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && (
        <Drawer
          app={open}
          profile={profiles[open.student_id] || {}}
          flag={flags[open.id]}
          onClose={() => setOpenId(null)}
          onSaved={reload}
        />
      )}
    </div>
  )
}

function Drawer({ app, profile, flag, onClose, onSaved }) {
  const { isMaster, uniById } = useAdmin()
  const uni = uniById[app.university_id]
  const program = (uni?.programs || []).find((p) => p.id === app.program_id)
  const [form, setForm] = useState(() => initial(app))
  const [events, setEvents] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    setForm(initial(app))
    setOk(false)
    setError('')
    supabase.from('application_events').select('*').eq('application_id', app.id).order('created_at', { ascending: false })
      .then(({ data }) => setEvents(data || []))
  }, [app])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const needsContract = form.status === 'ENROLLED'

  async function save(e) {
    e.preventDefault()
    setError('')
    if (needsContract && !Number(form.contract_amount)) {
      setError("\"To'lov qildi\" holati uchun 1-yil kontrakt summasini kiriting")
      return
    }
    setSaving(true)
    const patch = {
      status: form.status,
      note: form.note || null,
      exam_date: form.exam_date ? new Date(form.exam_date).toISOString() : null,
      contract_amount: form.contract_amount ? Number(String(form.contract_amount).replace(/\s/g, '')) : null,
    }
    if (isMaster && app.status === 'ENROLLED') patch.commission_status = form.commission_status
    const { error } = await supabase.from('applications').update(patch).eq('id', app.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    setOk(true)
    onSaved()
  }

  const certs = Array.isArray(profile.certificates) ? profile.certificates : []
  const preview = needsContract && form.contract_amount
    ? Math.round(Number(form.contract_amount) * Number(app.commission_rate ?? uni?.commission_rate ?? 0) / 100)
    : null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-brand-950/40" onClick={onClose} />
      <aside className="relative w-full max-w-xl h-full overflow-y-auto bg-cream shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-brand-100">
          <div>
            <p className="text-xs font-semibold text-slate-500">{app.code}</p>
            <h2 className="text-xl font-extrabold text-brand-900">{profile.full_name || 'Talaba'}</h2>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="p-2 rounded-lg hover:bg-brand-50"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {flag && (
            <div className="flex gap-2 p-3.5 rounded-xl bg-apricot-100 border border-apricot-300 text-apricot-900 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" /> {flag}
            </div>
          )}
          {app.student_enrolled_claim && (
            <div className="flex gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Talaba o'zi "o'qishga kirdim" deb tasdiqlagan ({dateTime(app.student_claimed_at)})
            </div>
          )}

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-bold text-brand-900"><User className="w-4 h-4" /> Talaba</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              <Field k="Telefon" v={profile.phone} />
              <Field k="Viloyat" v={profile.region} />
              <Field k="Maktab" v={profile.school_name} />
              <Field k="DTM bali" v={profile.test_score} />
              <Field k="Universitet" v={uni?.name} />
              <Field k="Yo'nalish" v={app.program_name} />
              {program?.tuition && <Field k="Yo'nalish narxi" v={money(program.tuition)} />}
              <Field k="Ariza sanasi" v={dateTime(app.created_at)} />
            </dl>
            {certs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {certs.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-apricot-100 text-apricot-800 text-xs font-semibold">
                    {c.title} {c.score}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {profile.diploma_url && <a className="text-brand-700 underline" href={profile.diploma_url} target="_blank" rel="noreferrer">Shahodatnoma</a>}
              {profile.portfolio_url && <a className="text-brand-700 underline" href={profile.portfolio_url} target="_blank" rel="noreferrer">Portfolio</a>}
            </div>
          </Card>

          <Card className="p-5">
            <form onSubmit={save} className="space-y-4">
              <h3 className="font-bold text-brand-900">Ariza holati</h3>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map((s) => (
                  <button
                    type="button"
                    key={s.value}
                    onClick={() => setForm({ ...form, status: s.value })}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                      form.status === s.value ? 'border-brand-700 bg-brand-800 text-white' : 'border-brand-100 bg-white text-slate-700 hover:border-brand-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {(form.status === 'EXAM' || form.exam_date) && (
                <div>
                  <label className="block text-sm font-semibold text-brand-900 mb-1.5">Imtihon sanasi va vaqti</label>
                  <input type="datetime-local" className={inputCls} value={form.exam_date} onChange={set('exam_date')} />
                </div>
              )}

              {(needsContract || form.status === 'CONTRACT' || form.contract_amount) && (
                <div>
                  <label className="block text-sm font-semibold text-brand-900 mb-1.5">
                    1-yil kontrakt summasi (so'm){needsContract && ' *'}
                  </label>
                  <input inputMode="numeric" className={inputCls} placeholder={program?.tuition ? String(program.tuition) : 'masalan: 18000000'}
                    value={form.contract_amount} onChange={set('contract_amount')} />
                  {preview != null && (
                    <p className="mt-1.5 text-sm text-apricot-700 font-semibold">
                      UniGoh ulushi ({Number(app.commission_rate ?? uni?.commission_rate)}%): {money(preview)}
                    </p>
                  )}
                </div>
              )}

              {isMaster && app.status === 'ENROLLED' && (
                <div>
                  <label className="block text-sm font-semibold text-brand-900 mb-1.5">Komissiya holati</label>
                  <select className={inputCls} value={form.commission_status} onChange={set('commission_status')}>
                    {['pending', 'invoiced', 'paid'].map((k) => <option key={k} value={k}>{COMMISSION[k].label}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-brand-900 mb-1.5">Izoh</label>
                <textarea rows={2} className={inputCls} value={form.note} onChange={set('note')} placeholder="Masalan: pasport nusxasi yetishmaydi" />
              </div>

              <ErrorBox error={error} />
              {ok && <p className="text-sm font-semibold text-emerald-700">Saqlandi</p>}
              <button className={`${btnPrimary} w-full py-3`} disabled={saving}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
            </form>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-brand-900">Tarix</h3>
            {events.length === 0 ? <p className="mt-2 text-sm text-slate-500">Hozircha bo'sh</p> : (
              <ol className="mt-3 space-y-3 border-l-2 border-brand-100 pl-4">
                {events.map((ev) => (
                  <li key={ev.id} className="text-sm">
                    <p className="font-semibold text-slate-800">{describe(ev)}</p>
                    <p className="text-xs text-slate-500">{dateTime(ev.created_at)} · {ROLE[ev.actor_role] || ev.actor_role}</p>
                    {ev.note && ev.kind === 'status' && <p className="text-xs text-slate-600 mt-0.5">“{ev.note}”</p>}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <button onClick={onClose} className={`${btnSecondary} w-full`}>Yopish</button>
        </div>
      </aside>
    </div>
  )
}

const ROLE = { student: 'Talaba', university_admin: 'Universitet', master: 'UniGoh' }

function describe(ev) {
  switch (ev.kind) {
    case 'created': return 'Ariza yuborildi'
    case 'status': return `${STATUS[ev.from_value]?.label || ev.from_value} → ${STATUS[ev.to_value]?.label || ev.to_value}`
    case 'contract': return `Kontrakt summasi: ${money(Number(ev.to_value))}`
    case 'commission': return `Komissiya: ${COMMISSION[ev.to_value]?.label || ev.to_value}`
    case 'student_claim': return ev.to_value === 'true' ? "Talaba: \"o'qishga kirdim\"" : 'Talaba tasdiqni bekor qildi'
    default: return ev.kind
  }
}

function initial(app) {
  const local = app.exam_date ? new Date(new Date(app.exam_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
  return {
    status: app.status,
    note: app.note || '',
    exam_date: local,
    contract_amount: app.contract_amount ?? '',
    commission_status: app.commission_status === 'none' ? 'pending' : app.commission_status,
  }
}

function Field({ k, v }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{k}</dt>
      <dd className="font-medium text-slate-800 break-words">{v || '—'}</dd>
    </div>
  )
}
