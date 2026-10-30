import React, { useMemo, useState } from 'react'
import { Download, Send, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { useApplications } from '../lib/data'
import { COMMISSION, money, mln, date, downloadCsv } from '../lib/constants'
import { Card, Stat, PageTitle, CommissionBadge, ErrorBox, Empty, inputCls, btnSecondary } from '../components/ui'

export default function Commissions() {
  const { isMaster, uniById, universities, staff } = useAdmin()
  const { apps, profiles, loading, error, reload } = useApplications()
  const [uni, setUni] = useState(isMaster ? '' : staff.university_id)
  const [cstatus, setCstatus] = useState('')
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')

  const enrolled = useMemo(
    () => apps.filter((a) => a.status === 'ENROLLED' && (!uni || a.university_id === uni) && (!cstatus || a.commission_status === cstatus)),
    [apps, uni, cstatus]
  )
  const sum = (st) => enrolled.filter((a) => a.commission_status === st).reduce((s, a) => s + Number(a.commission_amount || 0), 0)

  async function mark(ids, to) {
    setBusy(to); setErr('')
    const { error } = await supabase.from('applications').update({ commission_status: to }).in('id', ids)
    setBusy('')
    if (error) setErr(error.message)
    else reload()
  }

  function exportAct() {
    const u = uni ? uniById[uni] : null
    downloadCsv(`unigoh-akt-${u?.code || 'barcha'}-${new Date().toISOString().slice(0, 10)}.csv`, [
      [`UniGoh — komissiya hisoboti${u ? ': ' + u.name : ''}`],
      [`Sana: ${date(new Date())}`],
      [],
      ['Kod', 'Talaba', 'Universitet', "Yo'nalish", "O'qishga kirgan sana", 'Kontrakt (1-yil)', 'Foiz', 'Komissiya', 'Holat'],
      ...enrolled.map((a) => [
        a.code, profiles[a.student_id]?.full_name, uniById[a.university_id]?.name, a.program_name,
        date(a.updated_at), a.contract_amount, `${Number(a.commission_rate)}%`, a.commission_amount, COMMISSION[a.commission_status]?.label,
      ]),
      [],
      ['', '', '', '', '', '', 'Jami:', enrolled.reduce((s, a) => s + Number(a.commission_amount || 0), 0)],
    ])
  }

  const pendingIds = enrolled.filter((a) => a.commission_status === 'pending').map((a) => a.id)
  const invoicedIds = enrolled.filter((a) => a.commission_status === 'invoiced').map((a) => a.id)

  return (
    <div className="space-y-6">
      <PageTitle
        title="Komissiya"
        subtitle={isMaster
          ? "O'qishga kirgan har bir talaba uchun 1-yil kontraktidan UniGoh ulushi"
          : `${uniById[staff.university_id]?.name || ''}: UniGoh xizmati uchun to'lovlar`}
        action={<button onClick={exportAct} className={btnSecondary}><Download className="w-4 h-4" /> Akt-sverka (CSV)</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Kutilmoqda" value={mln(sum('pending'))} accent />
        <Stat label="Hisob yuborilgan" value={mln(sum('invoiced'))} />
        <Stat label="To'langan" value={mln(sum('paid'))} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          {isMaster && (
            <select className={`${inputCls} lg:w-64`} value={uni} onChange={(e) => setUni(e.target.value)}>
              <option value="">Barcha universitetlar</option>
              {universities.map((u) => <option key={u.id} value={u.id}>{u.name} ({Number(u.commission_rate)}%)</option>)}
            </select>
          )}
          <select className={`${inputCls} lg:w-52`} value={cstatus} onChange={(e) => setCstatus(e.target.value)}>
            <option value="">Barcha holatlar</option>
            {['pending', 'invoiced', 'paid'].map((k) => <option key={k} value={k}>{COMMISSION[k].label}</option>)}
          </select>
          {isMaster && (
            <div className="flex flex-wrap gap-2 lg:ml-auto">
              <button disabled={!pendingIds.length || !!busy} onClick={() => mark(pendingIds, 'invoiced')} className={btnSecondary}>
                <Send className="w-4 h-4" /> Kutilayotganlarga hisob yuborildi ({pendingIds.length})
              </button>
              <button disabled={!invoicedIds.length || !!busy} onClick={() => mark(invoicedIds, 'paid')} className={btnSecondary}>
                <CheckCircle2 className="w-4 h-4" /> Hisoblar to'landi ({invoicedIds.length})
              </button>
            </div>
          )}
        </div>
        {isMaster && <p className="mt-3 text-xs text-slate-500">Tugmalar yuqoridagi filtr bo'yicha ko'rinib turgan arizalarga qo'llanadi. Avval universitetni tanlang.</p>}
      </Card>

      <ErrorBox error={error || err} />

      <Card className="overflow-hidden">
        {loading ? <Empty>Yuklanmoqda...</Empty> : enrolled.length === 0 ? (
          <Empty>Hozircha o'qishga kirgan talabalar yo'q</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50/60">
                <tr className="text-left text-brand-900">
                  <th className="px-4 py-3 font-semibold">Talaba</th>
                  {isMaster && <th className="px-4 py-3 font-semibold">Universitet</th>}
                  <th className="px-4 py-3 font-semibold text-right">Kontrakt</th>
                  <th className="px-4 py-3 font-semibold text-right">Foiz</th>
                  <th className="px-4 py-3 font-semibold text-right">Ulush</th>
                  <th className="px-4 py-3 font-semibold">Holat</th>
                  {isMaster && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {enrolled.map((a) => (
                  <tr key={a.id} className="border-t border-brand-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-900">{profiles[a.student_id]?.full_name || '—'}</p>
                      <p className="text-xs text-slate-500">{a.code} · {a.program_name}</p>
                    </td>
                    {isMaster && <td className="px-4 py-3">{uniById[a.university_id]?.code}</td>}
                    <td className="px-4 py-3 text-right whitespace-nowrap">{money(a.contract_amount)}</td>
                    <td className="px-4 py-3 text-right">{Number(a.commission_rate)}%</td>
                    <td className="px-4 py-3 text-right font-bold text-apricot-700 whitespace-nowrap">{money(a.commission_amount)}</td>
                    <td className="px-4 py-3"><CommissionBadge status={a.commission_status} /></td>
                    {isMaster && (
                      <td className="px-4 py-3 text-right">
                        {a.commission_status !== 'paid' && (
                          <button
                            onClick={() => mark([a.id], a.commission_status === 'pending' ? 'invoiced' : 'paid')}
                            className="text-sm font-semibold text-brand-700 hover:text-brand-900 whitespace-nowrap"
                          >
                            {a.commission_status === 'pending' ? 'Hisob yuborildi' : "To'landi"}
                          </button>
                        )}
                      </td>
                    )}
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
