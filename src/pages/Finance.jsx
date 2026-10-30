import React, { useMemo, useState } from 'react'
import { Download, Send, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { useLedger } from '../lib/data'
import { COMMISSION, money, mln, date, downloadCsv } from '../lib/constants'
import { Card, Stat, PageTitle, CommissionBadge, ErrorBox, Empty, inputCls, btnSecondary } from '../components/ui'
import { go } from '../components/Shell'

export default function Finance({ params }) {
  const { uniById, universities } = useAdmin()
  const { rows, profiles, loading, error, reload } = useLedger()
  const [uni, setUni] = useState(params.get('uni') || '')
  const [st, setSt] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const list = useMemo(() => rows.filter((r) => (!uni || r.university_id === uni) && (!st || r.status === st)), [rows, uni, st])
  const byUni = useMemo(() => rows.filter((r) => !uni || r.university_id === uni), [rows, uni])
  const sum = (s) => byUni.filter((r) => r.status === s).reduce((a, r) => a + Number(r.amount || 0), 0)

  async function mark(ids, to) {
    if (!ids.length) return
    setBusy(true); setErr('')
    const { error } = await supabase.from('application_commissions').update({ status: to }).in('application_id', ids)
    setBusy(false)
    if (error) setErr(error.message)
    reload()
  }

  function exportAct() {
    const u = uni ? uniById[uni] : null
    downloadCsv(`unigoh-akt-${u?.code || 'barcha'}-${new Date().toISOString().slice(0, 10)}.csv`, [
      [`UniGoh — xizmat haqi hisoboti${u ? ': ' + u.name : ''}`],
      [`Sana: ${date(new Date())}`],
      [],
      ['Kod', 'Talaba', 'Universitet', "Yo'nalish", 'Sana', 'Kontrakt (1-yil)', 'Foiz', 'Summa', 'Holat'],
      ...list.map((r) => [r.code, profiles[r.student_id]?.full_name, uniById[r.university_id]?.name, r.program_name,
        date(r.created_at), r.contract_amount, `${Number(r.rate)}%`, r.amount, COMMISSION[r.status]?.label]),
      [],
      ['', '', '', '', '', '', 'Jami:', list.reduce((a, r) => a + Number(r.amount || 0), 0)],
    ])
  }

  const pending = list.filter((r) => r.status === 'pending').map((r) => r.application_id)
  const invoiced = list.filter((r) => r.status === 'invoiced').map((r) => r.application_id)

  // Universitetlar kesimida qarzdorlik
  const perUni = universities.map((u) => {
    const r = rows.filter((x) => x.university_id === u.id)
    return { u, open: r.filter((x) => x.status !== 'paid').reduce((a, x) => a + Number(x.amount || 0), 0), paid: r.filter((x) => x.status === 'paid').reduce((a, x) => a + Number(x.amount || 0), 0), n: r.length }
  }).filter((x) => x.n > 0)

  return (
    <div className="space-y-6">
      <PageTitle
        title="Moliya"
        subtitle="Faqat sizga ko'rinadi. O'qishga kirgan har bir talaba uchun 1-yil kontraktidan UniGoh ulushi."
        action={<button onClick={exportAct} className={btnSecondary}><Download className="w-4 h-4" /> Akt-sverka (Excel)</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Kutilmoqda" value={mln(sum('pending'))} accent />
        <Stat label="Hisob yuborilgan" value={mln(sum('invoiced'))} />
        <Stat label="To'langan" value={mln(sum('paid'))} />
      </div>

      {!uni && perUni.length > 0 && (
        <Card className="p-5">
          <h2 className="font-bold text-brand-900">Universitetlar bo'yicha</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b border-brand-100">
                <th className="py-2 font-medium">Universitet</th><th className="py-2 font-medium text-right">Talaba</th>
                <th className="py-2 font-medium text-right">To'lanmagan</th><th className="py-2 font-medium text-right">To'langan</th></tr></thead>
              <tbody>
                {perUni.map((x) => (
                  <tr key={x.u.id} onClick={() => setUni(x.u.id)} className="border-b border-brand-50 last:border-0 cursor-pointer hover:bg-cream">
                    <td className="py-2.5 font-semibold text-brand-900">{x.u.name}</td>
                    <td className="py-2.5 text-right">{x.n}</td>
                    <td className="py-2.5 text-right font-semibold text-apricot-700">{money(x.open)}</td>
                    <td className="py-2.5 text-right text-emerald-700">{money(x.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <select className={`${inputCls} lg:w-72`} value={uni} onChange={(e) => setUni(e.target.value)}>
            <option value="">Barcha universitetlar</option>
            {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select className={`${inputCls} lg:w-52`} value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="">Barcha holatlar</option>
            {['pending', 'invoiced', 'paid'].map((k) => <option key={k} value={k}>{COMMISSION[k].label}</option>)}
          </select>
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <button disabled={!uni || !pending.length || busy} onClick={() => mark(pending, 'invoiced')} className={btnSecondary}>
              <Send className="w-4 h-4" /> Hisob yuborildi ({pending.length})
            </button>
            <button disabled={!uni || !invoiced.length || busy} onClick={() => mark(invoiced, 'paid')} className={btnSecondary}>
              <CheckCircle2 className="w-4 h-4" /> To'landi ({invoiced.length})
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Ommaviy belgilash uchun avval universitetni tanlang. Bitta talabani jadvaldagi tugma orqali belgilasa bo'ladi.</p>
      </Card>

      <ErrorBox error={error || err} />

      <Card className="overflow-hidden">
        {loading ? <Empty>Yuklanmoqda...</Empty> : list.length === 0 ? <Empty>Hozircha o'qishga kirgan talabalar yo'q</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50/60">
                <tr className="text-left text-brand-900">
                  <th className="px-4 py-3 font-semibold">Talaba</th>
                  <th className="px-4 py-3 font-semibold">Universitet</th>
                  <th className="px-4 py-3 font-semibold text-right">Kontrakt</th>
                  <th className="px-4 py-3 font-semibold text-right">Foiz</th>
                  <th className="px-4 py-3 font-semibold text-right">Ulush</th>
                  <th className="px-4 py-3 font-semibold">Holat</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.application_id} className="border-t border-brand-50">
                    <td className="px-4 py-3">
                      <button onClick={() => go('student', { id: r.student_id })} className="text-left">
                        <p className="font-semibold text-brand-900 hover:text-brand-700">{profiles[r.student_id]?.full_name || '—'}</p>
                        <p className="text-xs text-slate-500">{r.code} · {r.program_name}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3">{uniById[r.university_id]?.code}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{money(r.contract_amount)}</td>
                    <td className="px-4 py-3 text-right">{Number(r.rate)}%</td>
                    <td className="px-4 py-3 text-right font-bold text-apricot-700 whitespace-nowrap">{money(r.amount)}</td>
                    <td className="px-4 py-3"><CommissionBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {r.status !== 'paid' && (
                        <button disabled={busy} onClick={() => mark([r.application_id], r.status === 'pending' ? 'invoiced' : 'paid')}
                          className="text-sm font-semibold text-brand-700 hover:text-brand-900 whitespace-nowrap">
                          {r.status === 'pending' ? 'Hisob yuborildi' : "To'landi"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
