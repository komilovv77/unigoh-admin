import React, { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { dateTime } from '../lib/constants'
import { Card, PageTitle, ErrorBox, Empty, inputCls, btnPrimary, btnSecondary } from '../components/ui'

// UniGoh–talaba shartnomasi shablonlari. Imzolangan versiya o'zgarmaydi:
// matnni o'zgartirish = yangi versiya yaratish va e'lon qilish.
export default function Contracts() {
  const { session } = useAdmin()
  const [rows, setRows] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(null)
  const [open, setOpen] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data, error }, { data: sig }] = await Promise.all([
      supabase.from('contract_templates').select('*').order('version', { ascending: false }),
      supabase.from('student_agreements').select('template_version'),
    ])
    if (error) setError(error.message)
    setRows(data || [])
    const c = {}
    for (const s of sig || []) c[s.template_version] = (c[s.template_version] || 0) + 1
    setCounts(c)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function newVersion() {
    const base = rows[0] || { title_uz: '', body_uz: '', title_ru: '', body_ru: '' }
    setDraft({ version: (rows[0]?.version || 0) + 1, title_uz: base.title_uz, body_uz: base.body_uz, title_ru: base.title_ru, body_ru: base.body_ru })
    setOpen(null)
  }

  async function saveDraft(publish) {
    setError('')
    if (!draft.title_uz.trim() || !draft.body_uz.trim() || !draft.title_ru.trim() || !draft.body_ru.trim()) {
      setError("Ikkala tildagi sarlavha va matnni to'ldiring.")
      return
    }
    setBusy(true)
    const { error } = await supabase.from('contract_templates').insert({ ...draft, is_active: false, created_by: session.user.id })
    if (!error && publish) {
      const r = await supabase.rpc('publish_contract_template', { p_version: draft.version })
      if (r.error) setError(r.error.message)
    }
    setBusy(false)
    if (error) { setError(error.message); return }
    setDraft(null)
    load()
  }

  async function publish(v) {
    if (!window.confirm(`${v}-versiyani e'lon qilasizmi? Shundan keyin har bir talaba yangi ariza berishdan oldin aynan shu versiyani imzolaydi.`)) return
    setError('')
    const { error } = await supabase.rpc('publish_contract_template', { p_version: v })
    if (error) setError(error.message)
    load()
  }

  const active = rows.find((r) => r.is_active)

  return (
    <div className="space-y-6">
      <PageTitle
        title="Talaba shartnomasi"
        subtitle="Talaba ariza berishdan oldin elektron imzolaydigan UniGoh–talaba shartnomasi"
        action={!draft && <button onClick={newVersion} className={btnPrimary}><Plus className="w-4 h-4" /> Yangi versiya</button>}
      />

      <Card className="p-5">
        {active ? (
          <p className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-5 h-5" /> Amaldagi versiya: {active.version}. Imzolaganlar: {counts[active.version] || 0}
          </p>
        ) : (
          <p className="text-apricot-800 font-semibold">
            Hech qaysi versiya e'lon qilinmagan. Hozircha talabalar shartnomasiz ariza bera oladi. Matnni yurist bilan tekshirib, e'lon qiling.
          </p>
        )}
        <p className="mt-2 text-sm text-slate-600">
          Imzolangan matn o'zgartirilmaydi. Matnni yangilash uchun yangi versiya yarating: e'lon qilingach, talabalar keyingi arizadan oldin uni qayta imzolaydi.
        </p>
      </Card>

      <ErrorBox error={error} />

      {draft && (
        <Card className="p-5 space-y-4">
          <h2 className="text-lg font-bold text-brand-900">{draft.version}-versiya (yangi)</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-900">Sarlavha (o'zbekcha)</label>
              <input className={inputCls} value={draft.title_uz} onChange={(e) => setDraft({ ...draft, title_uz: e.target.value })} />
              <label className="block text-sm font-semibold text-brand-900">Matn (o'zbekcha)</label>
              <textarea rows={18} className={`${inputCls} font-mono text-xs`} value={draft.body_uz} onChange={(e) => setDraft({ ...draft, body_uz: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-900">Заголовок (русский)</label>
              <input className={inputCls} value={draft.title_ru} onChange={(e) => setDraft({ ...draft, title_ru: e.target.value })} />
              <label className="block text-sm font-semibold text-brand-900">Текст (русский)</label>
              <textarea rows={18} className={`${inputCls} font-mono text-xs`} value={draft.body_ru} onChange={(e) => setDraft({ ...draft, body_ru: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-slate-500">[KOMPANIYA NOMI], STIR va manzil kabi qavs ichidagi joylarni to'ldirishni unutmang.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => saveDraft(true)} disabled={busy} className={btnPrimary}>Saqlash va e'lon qilish</button>
            <button onClick={() => saveDraft(false)} disabled={busy} className={btnSecondary}>Qoralama sifatida saqlash</button>
            <button onClick={() => setDraft(null)} className={btnSecondary}>Bekor qilish</button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? <Empty>Yuklanmoqda...</Empty> : rows.length === 0 ? <Empty>Shablonlar yo'q</Empty> : (
          <ul className="divide-y divide-brand-50">
            {rows.map((r) => (
              <li key={r.version} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-900">
                      {r.version}-versiya · {r.title_uz}
                      {r.is_active && <span className="ml-2 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">Amalda</span>}
                    </p>
                    <p className="text-xs text-slate-500">Yaratilgan: {dateTime(r.created_at)} · Imzolaganlar: {counts[r.version] || 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setOpen(open === r.version ? null : r.version)} className={btnSecondary}>{open === r.version ? 'Yopish' : "Matnni ko'rish"}</button>
                    {!r.is_active && <button onClick={() => publish(r.version)} className={btnPrimary}>E'lon qilish</button>}
                  </div>
                </div>
                {open === r.version && (
                  <div className="mt-4 grid lg:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-cream border border-apricot-100 text-sm whitespace-pre-line max-h-96 overflow-y-auto">{r.body_uz}</div>
                    <div className="p-4 rounded-xl bg-cream border border-apricot-100 text-sm whitespace-pre-line max-h-96 overflow-y-auto">{r.body_ru}</div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
