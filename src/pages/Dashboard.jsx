import React from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { useAdmin } from '../App'
import { useApplications } from '../lib/data'
import { FUNNEL, ACTIVE, STATUS, mln } from '../lib/constants'
import { Card, Stat, PageTitle, ErrorBox, Empty } from '../components/ui'
import { go } from '../components/Shell'

export default function Dashboard() {
  const { isMaster, staff, uniById, universities } = useAdmin()
  const { apps, flags, loading, error } = useApplications()

  if (loading) return <p className="text-slate-500">Yuklanmoqda...</p>

  const total = apps.length
  const active = apps.filter((a) => ACTIVE.includes(a.status)).length
  const enrolled = apps.filter((a) => a.status === 'ENROLLED')
  const conv = total ? Math.round((enrolled.length / total) * 100) : 0
  const expected = enrolled.filter((a) => a.commission_status === 'pending' || a.commission_status === 'invoiced')
    .reduce((s, a) => s + Number(a.commission_amount || 0), 0)
  const paid = enrolled.filter((a) => a.commission_status === 'paid').reduce((s, a) => s + Number(a.commission_amount || 0), 0)
  const flagCount = Object.keys(flags).length

  // Voronka: har bir bosqichga yetganlar soni
  const reached = (st) => apps.filter((a) => FUNNEL.indexOf(a.status) >= FUNNEL.indexOf(st)).length
  const funnel = FUNNEL.map((st) => ({ st, n: reached(st) }))
  const max = Math.max(1, funnel[0].n)

  const perUni = universities.map((u) => {
    const list = apps.filter((a) => a.university_id === u.id)
    const enr = list.filter((a) => a.status === 'ENROLLED')
    return {
      u,
      total: list.length,
      enrolled: enr.length,
      conv: list.length ? Math.round((enr.length / list.length) * 100) : 0,
      commission: enr.reduce((s, a) => s + Number(a.commission_amount || 0), 0),
    }
  }).filter((r) => isMaster ? true : r.u.id === staff.university_id)

  return (
    <div className="space-y-6">
      <PageTitle
        title="Bosh panel"
        subtitle={isMaster ? 'Butun platforma bo\'yicha umumiy holat' : uniById[staff.university_id]?.name}
      />
      <ErrorBox error={error} />

      {flagCount > 0 && (
        <button
          onClick={() => go('applications', { flag: '1' })}
          className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-apricot-100 border border-apricot-300 text-left"
        >
          <span className="flex items-center gap-3 text-apricot-900 font-semibold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {flagCount} ta arizada e'tibor talab qilinadi (talaba va OTM ma'lumotlari mos emas yoki uzoq vaqt harakatsiz)
          </span>
          <ArrowRight className="w-5 h-5 text-apricot-800 shrink-0" />
        </button>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Jami arizalar" value={total} />
        <Stat label="Jarayonda" value={active} />
        <Stat label="O'qishga kirdi" value={enrolled.length} hint={`Konversiya: ${conv}%`} />
        <Stat
          label={isMaster ? 'Komissiya (kutilmoqda)' : 'UniGoh ulushi (to\'lanmagan)'}
          value={mln(expected)}
          hint={`To'langan: ${mln(paid)}`}
          accent
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-brand-900">Ariza voronkasi</h2>
          <p className="text-sm text-slate-500">Har bir bosqichga yetgan arizalar</p>
          <div className="mt-5 space-y-3">
            {funnel.map(({ st, n }) => (
              <button key={st} onClick={() => go('applications', { status: st })} className="block w-full text-left group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 group-hover:text-brand-800">{STATUS[st].label}</span>
                  <span className="font-bold text-brand-900">{n}</span>
                </div>
                <div className="h-2.5 rounded-full bg-brand-50 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${st === 'ENROLLED' ? 'bg-apricot-500' : 'bg-brand-700'}`}
                    style={{ width: `${(n / max) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-brand-900">{isMaster ? 'Universitetlar kesimida' : 'Natijalar'}</h2>
          <p className="text-sm text-slate-500">Arizalar, o'qishga kirganlar va komissiya</p>
          {perUni.length === 0 ? (
            <Empty>Universitetlar hali qo'shilmagan</Empty>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-brand-100">
                    <th className="py-2 font-medium">Universitet</th>
                    <th className="py-2 font-medium text-right">Ariza</th>
                    <th className="py-2 font-medium text-right">Kirdi</th>
                    <th className="py-2 font-medium text-right">Konv.</th>
                    <th className="py-2 font-medium text-right">Komissiya</th>
                  </tr>
                </thead>
                <tbody>
                  {perUni.map((r) => (
                    <tr key={r.u.id} className="border-b border-brand-50 last:border-0">
                      <td className="py-2.5 font-semibold text-brand-900">
                        {r.u.code}
                        <span className="ml-1.5 text-xs font-normal text-slate-500">{Number(r.u.commission_rate)}%</span>
                      </td>
                      <td className="py-2.5 text-right">{r.total}</td>
                      <td className="py-2.5 text-right">{r.enrolled}</td>
                      <td className="py-2.5 text-right">{r.conv}%</td>
                      <td className="py-2.5 text-right font-semibold text-apricot-700">{mln(r.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
