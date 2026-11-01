import React, { useEffect, useState } from 'react'
import { AlertTriangle, X, CheckCircle2, ExternalLink, FileSignature } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { STATUSES, STATUS, COMMISSION, money, dateTime, allowedStatuses } from '../lib/constants'
import { Card, ErrorBox, inputCls, btnPrimary, btnSecondary } from './ui'
import { go } from './Shell'

export default function ApplicationDrawer({ app, profile, flag, ledgerRow, onClose, onSaved }) {
  const { isMaster, uniById } = useAdmin()
  const uni = uniById[app.university_id]
  const program = (uni?.programs || []).find((p) => p.id === app.program_id)
  const [form, setForm] = useState(() => initial(app))
  const [cstatus, setCstatus] = useState(ledgerRow?.status || 'pending')
  const [events, setEvents] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [agreement, setAgreement] = useState(undefined)

  useEffect(() => {
    supabase.from('student_agreements').select('template_version, full_name, signed_at, lang, signature_path, text_hash')
      .eq('student_id', app.student_id).order('signed_at', { ascending: false }).limit(1)
      .then(({ data }) => setAgreement(data?.[0] || null))
  }, [app.student_id])


  useEffect(() => {
    setForm(initial(app))
    setCstatus(ledgerRow?.status || 'pending')
    setOk(false)
    setError('')
    supabase.from('application_events').select('*').eq('application_id', app.id).order('created_at', { ascending: false })
      .then(({ data }) => setEvents(data || []))
  }, [app, ledgerRow])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const needsContract = form.status === 'ENROLLED'

  async function save(e) {
    e.preventDefault()
    setError('')
    const contract = form.contract_amount ? Number(String(form.contract_amount).replace(/\s/g, '')) : null
    if (needsContract && !contract) {
      setError("\"To'lov qildi\" holati uchun 1-yil kontrakt summasini kiriting")
      return
    }
    setSaving(true)
    const { error } = await supabase.from('applications').update({
      status: form.status,
      note: form.note || null,
      exam_date: form.exam_date ? new Date(form.exam_date).toISOString() : null,
      contract_amount: contract,
    }).eq('id', app.id)
    if (!error && isMaster && ledgerRow && cstatus !== ledgerRow.status) {
      const r = await supabase.from('application_commissions').update({ status: cstatus }).eq('application_id', app.id)
      if (r.error) setError(r.error.message)
    }
    setSaving(false)
    if (error) { setError(error.message); return }
    setOk(true)
    onSaved()
  }

  const certs = Array.isArray(profile.certificates) ? profile.certificates.filter((c) => c && (c.title || c.file_url)) : []

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-brand-950/40" onClick={onClose} />
      <aside className="relative w-full max-w-xl h-full overflow-y-auto bg-cream shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-brand-100">
          <div>
            <p className="text-xs font-semibold text-slate-500">{app.code} · {uni?.code}</p>
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
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-brand-900">Ariza</h3>
              <button onClick={() => { onClose(); go('student', { id: app.student_id }) }} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900">
                Talaba sahifasi <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              <Field k="Universitet" v={uni?.name} />
              <Field k="Yo'nalish" v={app.program_name} />
              {app.source === 'grant' && <Field k="Manba" v={`UniGoh grant tanlovi · talabaning ${app.choice_rank}-tanlovi`} />}
              {app.grant_percent && <Field k="Grant" v={`${app.grant_percent}% · ${app.grant_funded_by === 'university' ? 'universitet granti' : 'UniGoh granti'}`} />}
              {program?.tuition && <Field k="Yo'nalish narxi" v={money(program.tuition)} />}
              <Field k="Telefon" v={profile.phone || (profile.contact_visible === false ? 'Talaba rozilik bergach ochiladi' : null)} />
              <Field k="Viloyat" v={profile.region} />
              <Field k="Ariza sanasi" v={dateTime(app.created_at)} />
            </dl>
            <Documents profile={profile} certs={certs} />
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-bold text-brand-900"><FileSignature className="w-4 h-4" /> Talaba roziligi va shartnoma</h3>
            {app.forwarded_at && <p className="mt-2 text-sm font-semibold text-apricot-800">Talaba rozilik bergan: {dateTime(app.forwarded_at)}. Iltimos, talaba bilan bog'laning.</p>}
            {agreement === undefined ? <p className="mt-2 text-sm text-slate-500">Yuklanmoqda...</p> : agreement ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="text-emerald-700 font-semibold inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Imzolangan: {agreement.full_name}, {dateTime(agreement.signed_at)} ({agreement.template_version}-versiya, {agreement.lang === 'ru' ? 'ruscha' : "o'zbekcha"})
                </p>
                <button type="button" onClick={() => openStored(agreement.signature_path)} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-900">
                  Imzoni ko'rish <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Talaba hali imzolamagan. Universitet qabul qilgach, talaba saytda rozilik beradi (shartnoma e'lon qilingan bo'lsa — imzolaydi) va ariza avtomatik ravishda «Talaba rozi — bog'laning» holatiga o'tadi.</p>
            )}

          </Card>

          <Card className="p-5">
            <form onSubmit={save} className="space-y-4">
              <h3 className="font-bold text-brand-900">Holat</h3>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.filter((s) => allowedStatuses(app, isMaster).includes(s.value)).map((s) => (
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
                  <label className="block text-sm font-semibold text-brand-900 mb-1.5">Suhbat yoki imtihon sanasi va vaqti</label>
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
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-brand-900 mb-1.5">Talabaga xabar (saytda va Telegram'da ko'rinadi)</label>
                <textarea rows={2} className={inputCls} value={form.note} onChange={set('note')} placeholder="Masalan: suhbatga pasport aslini olib keling" />
              </div>

              {isMaster && ledgerRow && (
                <div className="p-4 rounded-xl bg-apricot-50 border border-apricot-200 space-y-3">
                  <p className="text-sm font-bold text-apricot-900">UniGoh ulushi (faqat sizga ko'rinadi)</p>
                  <p className="text-2xl font-extrabold text-apricot-700">{money(ledgerRow.amount)}</p>
                  <p className="text-xs text-apricot-800">{Number(ledgerRow.rate)}% × {money(ledgerRow.contract_amount)}</p>
                  <select className={inputCls} value={cstatus} onChange={(e) => setCstatus(e.target.value)}>
                    {['pending', 'invoiced', 'paid'].map((k) => <option key={k} value={k}>{COMMISSION[k].label}</option>)}
                  </select>
                </div>
              )}

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

const DOC_LABEL = { enrollment: "O'qishga kirganlik dalili (shartnoma / guvohnoma)", passport: 'Pasport / ID karta', diploma: 'Shahodatnoma / attestat', dtm: 'DTM / imtihon natijasi', certificate: 'Sertifikat', portfolio: 'Portfolio', other: 'Boshqa hujjat' }
const DOC_ORDER = ['enrollment', 'passport', 'diploma', 'dtm', 'certificate', 'portfolio', 'other']

export async function openStored(path) {
  const win = window.open('', '_blank')
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 300)
  if (error) { win?.close(); window.alert("Faylni ochib bo'lmadi: " + error.message); return }
  if (win) win.location.href = data.signedUrl
  else window.location.href = data.signedUrl
}

export function Documents({ profile, certs }) {
  const list = certs ?? (Array.isArray(profile.certificates) ? profile.certificates.filter((c) => c && (c.title || c.file_url)) : [])
  const stored = Array.isArray(profile.documents) ? profile.documents : []
  const docs = [
    ...[...stored].sort((a, b) => DOC_ORDER.indexOf(a.kind) - DOC_ORDER.indexOf(b.kind))
      .map((d) => ({ label: `${DOC_LABEL[d.kind] || 'Hujjat'}: ${d.title ? `${d.title}${d.score ? ' — ' + d.score : ''}` : d.name}`, path: d.path, type: d.type })),
    // Eski profillardan qolgan havolalar (yangi talabalarda bo'lmaydi)
    profile.diploma_url && { label: 'Shahodatnoma / attestat (eski havola)', url: profile.diploma_url },
    profile.portfolio_url && { label: 'Portfolio (eski havola)', url: profile.portfolio_url },
    ...list.map((c) => ({ label: `${c.title || 'Sertifikat'}${c.score ? ' — ' + c.score : ''}${c.file_url ? ' (eski havola)' : ''}`, url: c.file_url })),
  ].filter(Boolean)
  const hiddenPassport = profile.contact_visible === false
  const missing = ['passport', 'diploma'].filter((k) => !(k === 'passport' && hiddenPassport) && !stored.some((d) => d.kind === k))

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-500 mb-2">Hujjatlar</p>
      {hiddenPassport && <p className="mb-2 text-xs text-slate-500">Pasport talaba rozilik bergandan keyin ochiladi.</p>}
      {missing.length > 0 && <p className="mb-2 text-xs font-semibold text-apricot-800">Yuklanmagan: {missing.map((k) => DOC_LABEL[k]).join(', ')}</p>}
      {docs.length === 0 ? <p className="text-sm text-slate-500">Hujjat yuklanmagan</p> : (
        <ul className="space-y-1.5">
          {docs.map((d, i) => (
            <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-cream border border-apricot-100 text-sm">
              <span className="font-medium text-slate-800">{d.label}{d.type && <span className="ml-1.5 text-xs font-semibold text-slate-400">{d.type === 'application/pdf' ? 'PDF' : d.type === 'image/png' ? 'PNG' : 'JPG'}</span>}</span>
              {d.path
                ? <button type="button" onClick={() => openStored(d.path)} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-900 shrink-0">Ochish <ExternalLink className="w-3.5 h-3.5" /></button>
                : d.url
                ? <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-900 shrink-0">Ochish <ExternalLink className="w-3.5 h-3.5" /></a>
                : <span className="text-xs text-slate-400 shrink-0">fayl yo'q</span>}
            </li>
          ))}
        </ul>
      )}
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
  }
}

export function Field({ k, v }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{k}</dt>
      <dd className="font-medium text-slate-800 break-words">{v || '—'}</dd>
    </div>
  )
}
