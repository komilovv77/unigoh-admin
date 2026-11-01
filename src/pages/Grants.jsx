import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Award, Download, Megaphone, Search, X, Settings2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { loadProfiles } from '../lib/data'
import { dateTime, money, downloadCsv } from '../lib/constants'
import { Card, PageTitle, ErrorBox, Empty, Stat, inputCls, btnPrimary, btnSecondary } from '../components/ui'
import { Documents, Field } from '../components/ApplicationDrawer'

// Grant tanlovi — faqat bosh adminlar (bazada ham shunday cheklangan)
const DECISION = {
  ACCEPTED: { label: 'Grant berildi', cls: 'bg-emerald-50 text-emerald-700' },
  WAITLISTED: { label: "Zaxira ro'yxati", cls: 'bg-apricot-100 text-apricot-800' },
  REJECTED: { label: 'Rad etildi', cls: 'bg-red-50 text-red-700' },
}
const FEE = {
  unpaid: { label: "To'lanmagan", cls: 'bg-slate-100 text-slate-600' },
  paid: { label: "To'langan", cls: 'bg-emerald-50 text-emerald-700' },
  waived: { label: 'Ozod qilingan', cls: 'bg-brand-50 text-brand-700' },
}
const Badge = ({ m, v }) => v && m[v] ? <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${m[v].cls}`}>{m[v].label}</span> : <span className="text-xs text-slate-400">—</span>

export default function Grants() {
  const [settings, setSettings] = useState(null)
  const [apps, setApps] = useState([])
  const [reviews, setReviews] = useState({})
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [fee, setFee] = useState('')
  const [dec, setDec] = useState('')
  const [openId, setOpenId] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: s } = await supabase.from('grant_settings').select('*').maybeSingle()
    setSettings(s)
    const [{ data: a, error }, { data: r }] = await Promise.all([
      supabase.from('grant_applications').select('*').eq('season', s?.season ?? 0).order('created_at', { ascending: false }),
      supabase.from('grant_reviews').select('*'),
    ])
    if (error) setError(error.message)
    setApps(a || [])
    setReviews(Object.fromEntries((r || []).map((x) => [x.application_id, x])))
    setProfiles(await loadProfiles([...new Set((a || []).map((x) => x.student_id))]))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return apps.filter((a) => {
      const r = reviews[a.id]
      if (fee && a.fee_status !== fee) return false
      if (dec === 'none' ? r?.decision : dec && r?.decision !== dec) return false
      if (!s) return true
      return [a.full_name, a.code, profiles[a.student_id]?.phone, ...(a.choices || []).map((c) => c.university)].some((v) => String(v || '').toLowerCase().includes(s))
    }).sort((x, y) => (reviews[y.id]?.score ?? -1) - (reviews[x.id]?.score ?? -1))
  }, [apps, reviews, profiles, q, fee, dec])

  const counted = apps.filter((a) => a.fee_status !== 'unpaid')
  const by = (d) => counted.filter((a) => reviews[a.id]?.decision === d).length
  const pending = counted.filter((a) => !reviews[a.id]?.decision).length
  const income = apps.filter((a) => a.fee_status === 'paid').length * (settings?.fee || 0)

  async function publish() {
    if (!window.confirm(`Natijalar ${counted.length} ta ishtirokchiga bir vaqtda e'lon qilinadi va SMS yuboriladi. Shundan keyin qarorlarni o'zgartirib bo'lmaydi. Davom etasizmi?`)) return
    setError('')
    const { data, error } = await supabase.rpc('grant_publish')
    if (error) return setError(error.message)
    window.alert(`E'lon qilindi: ${data} ta ishtirokchi xatini oldi.`)
    load()
  }

  function exportCsv() {
    downloadCsv(`grant-${settings?.season}.csv`, [
      ['ID', 'Ism', 'Telefon', 'DTM', 'Tanlovlar', "To'lov", 'Ball', 'Qaror', 'Grant %', 'Universitet', "Yo'nalish", 'Moliyalashtiradi'],
      ...list.map((a) => {
        const r = reviews[a.id] || {}
        return [a.code, a.full_name, profiles[a.student_id]?.phone, a.dtm_score, (a.choices || []).map((c) => `${c.university} — ${c.program}`).join('; '),
          FEE[a.fee_status]?.label, r.score, DECISION[r.decision]?.label, r.award_percent, r.award_university_id, r.award_program, r.funded_by]
      }),
    ])
  }

  const open = apps.find((a) => a.id === openId)
  const published = !!settings?.results_published_at

  return (
    <div className="space-y-6">
      <PageTitle
        title="Grant tanlovi"
        subtitle={settings ? `${settings.season}-mavsum · ariza to'lovi ${money(settings.fee)} · DTM ≥ ${settings.min_dtm}${published ? ` · natijalar e'lon qilingan: ${dateTime(settings.results_published_at)}` : settings.accepting ? ' · arizalar qabul qilinmoqda' : ' · qabul yopiq'}` : ''}
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowSettings(!showSettings)} className={btnSecondary}><Settings2 className="w-4 h-4" /> Sozlamalar</button>
            <button onClick={exportCsv} className={btnSecondary}><Download className="w-4 h-4" /> Excel</button>
            {!published && <button onClick={publish} disabled={!counted.length} className={btnPrimary}><Megaphone className="w-4 h-4" /> Natijalarni e'lon qilish</button>}
          </div>
        }
      />
      <ErrorBox error={error} />
      {showSettings && settings && <SettingsCard s={settings} onSaved={() => { setShowSettings(false); load() }} />}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="Jami arizalar" value={apps.length} hint={`${apps.length - counted.length} ta to'lanmagan`} />
        <Stat label="Ko'rib chiqiladi" value={counted.length} hint={`${pending} tasiga qaror yo'q`} />
        <Stat label="Grant berildi" value={by('ACCEPTED')} accent />
        <Stat label="Zaxira / rad" value={`${by('WAITLISTED')} / ${by('REJECTED')}`} />
        <Stat label="To'lovlardan tushum" value={money(income)} />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_200px]">
          <label className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input className={`${inputCls} pl-10`} placeholder="Ism, ID, telefon yoki universitet" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <select className={inputCls} value={fee} onChange={(e) => setFee(e.target.value)}>
            <option value="">Barcha to'lovlar</option>
            {Object.entries(FEE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className={inputCls} value={dec} onChange={(e) => setDec(e.target.value)}>
            <option value="">Barcha qarorlar</option>
            <option value="none">Qaror chiqarilmagan</option>
            {Object.entries(DECISION).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? <Empty>Yuklanmoqda...</Empty> : list.length === 0 ? <Empty>Grant arizalari yo'q</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50/60">
                <tr className="text-left text-brand-900">
                  <th className="px-4 py-3 font-semibold">Talaba</th>
                  <th className="px-4 py-3 font-semibold">DTM</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Tanlovlar</th>
                  <th className="px-4 py-3 font-semibold">To'lov</th>
                  <th className="px-4 py-3 font-semibold">Ball</th>
                  <th className="px-4 py-3 font-semibold">Qaror</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => {
                  const r = reviews[a.id] || {}
                  return (
                    <tr key={a.id} onClick={() => setOpenId(a.id)} className="border-t border-brand-50 cursor-pointer hover:bg-cream align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-900">{a.full_name}</p>
                        <p className="text-xs text-slate-500">{a.code} · {dateTime(a.created_at)}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold">{a.dtm_score}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-600 text-xs">{(a.choices || []).map((c, i) => <p key={i}>{c.university} — {c.program}</p>)}</td>
                      <td className="px-4 py-3"><Badge m={FEE} v={a.fee_status} /></td>
                      <td className="px-4 py-3 font-semibold">{r.score ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge m={DECISION} v={r.decision} />
                        {r.decision === 'ACCEPTED' && r.award_percent && <p className="mt-1 text-xs font-semibold text-apricot-700">{r.award_percent}% · {r.funded_by === 'university' ? 'universitet' : 'UniGoh'}</p>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && (
        <GrantDrawer app={open} review={reviews[open.id]} profile={profiles[open.student_id] || {}} locked={published}
          onClose={() => setOpenId(null)} onSaved={load} />
      )}
    </div>
  )
}

function SettingsCard({ s, onSaved }) {
  const [f, setF] = useState({ season: s.season, fee: s.fee, min_dtm: s.min_dtm, deadline: s.deadline || '', accepting: s.accepting })
  const [err, setErr] = useState('')
  async function save(e) {
    e.preventDefault()
    setErr('')
    const patch = { season: Number(f.season), fee: Number(f.fee), min_dtm: Number(f.min_dtm), deadline: f.deadline || null, accepting: f.accepting, updated_at: new Date() }
    if (Number(f.season) !== s.season) {
      if (!window.confirm(`${f.season}-mavsum boshlansinmi? Yangi mavsumda talabalar qaytadan ariza beradi, natijalar e'loni nolga tushadi.`)) return
      patch.results_published_at = null
    }
    const { error } = await supabase.from('grant_settings').update(patch).eq('id', true)
    if (error) return setErr(error.message)
    onSaved()
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  return (
    <Card className="p-5">
      <form onSubmit={save} className="space-y-4">
        <h2 className="font-bold text-brand-900">Tanlov sozlamalari</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          <L t="Mavsum (yil)"><input type="number" className={inputCls} value={f.season} onChange={set('season')} /></L>
          <L t="Ariza to'lovi (so'm)"><input type="number" className={inputCls} value={f.fee} onChange={set('fee')} /></L>
          <L t="Minimal DTM bali"><input type="number" step="0.1" className={inputCls} value={f.min_dtm} onChange={set('min_dtm')} /></L>
          <L t="Oxirgi muddat"><input type="date" className={inputCls} value={f.deadline} onChange={set('deadline')} /></L>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" className="w-4 h-4 accent-blue-800" checked={f.accepting} onChange={set('accepting')} /> Arizalar qabul qilinmoqda
        </label>
        <ErrorBox error={err} />
        <button className={btnPrimary}>Saqlash</button>
      </form>
    </Card>
  )
}

function L({ t, children }) {
  return <label className="block"><span className="block text-xs font-semibold text-brand-900 mb-1">{t}</span>{children}</label>
}

function GrantDrawer({ app, review, profile, locked, onClose, onSaved }) {
  const { uniById } = useAdmin()
  const [r, setR] = useState({
    score: review?.score ?? '', decision: review?.decision || '', award_percent: review?.award_percent || '',
    award_university_id: review?.award_university_id || '', award_program: review?.award_program || '',
    funded_by: review?.funded_by || '', note: review?.note || '',
  })
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  const choice = (app.choices || []).find((c) => c.university_id === r.award_university_id)

  async function setFee(status) {
    setErr(''); setOk('')
    const { error } = await supabase.rpc('grant_set_fee', { p_id: app.id, p_status: status })
    if (error) return setErr(error.message)
    setOk("To'lov holati yangilandi")
    onSaved()
  }

  async function save(e) {
    e.preventDefault()
    setErr(''); setOk('')
    if (r.decision === 'ACCEPTED' && (!r.award_percent || !r.award_university_id || !r.funded_by)) {
      return setErr("Grant berilsa: foiz, universitet va kim moliyalashtirishini tanlang.")
    }
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    const accepted = r.decision === 'ACCEPTED'
    const { error } = await supabase.from('grant_reviews').upsert({
      application_id: app.id,
      score: r.score === '' ? null : Number(r.score),
      decision: r.decision || null,
      award_percent: accepted ? Number(r.award_percent) : null,
      award_university_id: accepted ? r.award_university_id : null,
      award_program: accepted ? (choice?.program || r.award_program || null) : null,
      funded_by: accepted ? r.funded_by : null,
      note: r.note || null,
      reviewed_by: user?.id,
      updated_at: new Date(),
    })
    setBusy(false)
    if (error) return setErr(error.message)
    setOk('Saqlandi')
    onSaved()
  }

  const set = (k) => (e) => setR({ ...r, [k]: e.target.value })

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-brand-950/40" onClick={onClose} />
      <aside className="relative w-full max-w-2xl h-full overflow-y-auto bg-cream shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-brand-100">
          <div>
            <p className="text-xs font-semibold text-slate-500">{app.code} · grant arizasi</p>
            <h2 className="text-xl font-extrabold text-brand-900">{app.full_name}</h2>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="p-2 rounded-lg hover:bg-brand-50"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <Card className="p-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              <Field k="DTM bali" v={app.dtm_score} />
              <Field k="Telefon" v={profile.phone} />
              <Field k="Viloyat" v={profile.region} />
              <Field k="Maktab" v={profile.school_name} />
              <Field k="Yuborilgan" v={dateTime(app.created_at)} />
              <Field k="To'lov" v={FEE[app.fee_status]?.label + (app.paid_at ? ` · ${dateTime(app.paid_at)}` : '')} />
            </dl>
            {!locked && (
              <div className="mt-4 flex flex-wrap gap-2">
                {app.fee_status !== 'paid' && <button onClick={() => setFee('paid')} className={btnSecondary}>To'landi deb belgilash</button>}
                {app.fee_status !== 'waived' && <button onClick={() => setFee('waived')} className={btnSecondary}>To'lovdan ozod qilish</button>}
                {app.fee_status !== 'unpaid' && <button onClick={() => setFee('unpaid')} className="text-sm font-semibold text-red-600 px-2">To'lanmagan</button>}
              </div>
            )}
            <Documents profile={profile} />
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-brand-900">Tanlangan universitetlar</h3>
            <ol className="mt-2 list-decimal pl-5 text-sm space-y-1">
              {(app.choices || []).map((c, i) => <li key={i}><b>{c.university}</b> — {c.program}</li>)}
            </ol>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-brand-900">Motivatsion xat</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-800 whitespace-pre-line">{app.motivation}</p>
          </Card>

          <Card className="p-5">
            <form onSubmit={save} className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-brand-900"><Award className="w-5 h-5 text-apricot-600" /> Baholash va qaror</h3>
              {app.fee_status === 'unpaid' && <p className="text-sm text-apricot-800 font-medium">To'lov qilinmagan ariza natijalarda ko'rib chiqilmaydi.</p>}
              {locked && <p className="text-sm text-slate-600">Natijalar e'lon qilingan — qarorni o'zgartirib bo'lmaydi.</p>}
              <fieldset disabled={locked} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <L t="Ball (0–100)"><input type="number" min="0" max="100" step="0.5" className={inputCls} value={r.score} onChange={set('score')} /></L>
                  <L t="Qaror">
                    <select className={inputCls} value={r.decision} onChange={set('decision')}>
                      <option value="">— qaror yo'q —</option>
                      {Object.entries(DECISION).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </L>
                </div>
                {r.decision === 'ACCEPTED' && (
                  <div className="grid sm:grid-cols-3 gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <L t="Grant foizi">
                      <select className={inputCls} value={r.award_percent} onChange={set('award_percent')}>
                        <option value="">—</option>
                        {[100, 75, 50, 25].map((p) => <option key={p} value={p}>{p}%</option>)}
                      </select>
                    </L>
                    <L t="Universitet va yo'nalish">
                      <select className={inputCls} value={r.award_university_id} onChange={set('award_university_id')}>
                        <option value="">—</option>
                        {(app.choices || []).map((c) => <option key={c.university_id} value={c.university_id}>{uniById[c.university_id]?.code || c.university} — {c.program}</option>)}
                      </select>
                    </L>
                    <L t="Kim moliyalashtiradi">
                      <select className={inputCls} value={r.funded_by} onChange={set('funded_by')}>
                        <option value="">—</option>
                        <option value="university">Universitet</option>
                        <option value="unigoh">UniGoh</option>
                      </select>
                    </L>
                  </div>
                )}
                <L t="Ichki izoh (talabaga ko'rinmaydi)"><textarea rows={3} className={inputCls} value={r.note} onChange={set('note')} /></L>
                <ErrorBox error={err} />
                {ok && <p className="text-sm font-semibold text-emerald-700">{ok}</p>}
                <button disabled={busy} className={btnPrimary}>Saqlash</button>
              </fieldset>
            </form>
          </Card>
        </div>
      </aside>
    </div>
  )
}
