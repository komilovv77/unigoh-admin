import React, { useMemo, useState } from 'react'
import { Search, AlertTriangle, Download } from 'lucide-react'
import { useAdmin } from '../App'
import { STATUSES, STATUS, money, date, downloadCsv } from '../lib/constants'
import { Card, StatusBadge, CommissionBadge, Empty, inputCls, btnSecondary } from './ui'
import ApplicationDrawer from './ApplicationDrawer'

export default function AppTable({ data, showUniversity = false, initialStatus = '', initialQuery = '', initialFlag = false, extraFilter }) {
  const { isMaster, uniById } = useAdmin()
  const { apps, profiles, flags, ledger, loading, reload } = data
  const [status, setStatus] = useState(initialStatus)
  const [q, setQ] = useState(initialQuery)
  const [onlyFlags, setOnlyFlags] = useState(initialFlag)
  const [openId, setOpenId] = useState(null)

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return apps.filter((a) => {
      if (status && a.status !== status) return false
      if (onlyFlags && !flags[a.id]) return false
      if (extraFilter && !extraFilter(a)) return false
      if (!s) return true
      const p = profiles[a.student_id] || {}
      return [a.code, p.full_name, p.phone, a.program_name, p.region].some((v) => String(v || '').toLowerCase().includes(s))
    })
  }, [apps, profiles, flags, status, q, onlyFlags, extraFilter])

  const open = apps.find((a) => a.id === openId)

  function exportCsv() {
    const head = ['Kod', 'Talaba', 'Telefon', 'Viloyat', 'Maktab', 'DTM', 'Universitet', "Yo'nalish", 'Holat', 'Kontrakt', 'Sana']
    if (isMaster) head.push('UniGoh ulushi')
    downloadCsv(`unigoh-arizalar-${new Date().toISOString().slice(0, 10)}.csv`, [
      head,
      ...list.map((a) => {
        const p = profiles[a.student_id] || {}
        const row = [a.code, p.full_name, p.phone, p.region, p.school_name, p.test_score, uniById[a.university_id]?.name,
          a.program_name, STATUS[a.status]?.label, a.contract_amount, date(a.created_at)]
        if (isMaster) row.push(ledger[a.id]?.amount ?? '')
        return row
      }),
    ])
  }

  return (
    <div>
      <Card className="p-4 mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto_auto] items-center">
          <label className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input className={`${inputCls} pl-10`} placeholder="Ism, telefon, kod yoki yo'nalish" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Barcha holatlar</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-1">
            <input type="checkbox" checked={onlyFlags} onChange={(e) => setOnlyFlags(e.target.checked)} className="w-4 h-4 accent-amber-500" />
            Ogohlantirishlar
          </label>
          <button onClick={exportCsv} className={btnSecondary}><Download className="w-4 h-4" /> Excel</button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? <Empty>Yuklanmoqda...</Empty> : list.length === 0 ? <Empty>Arizalar topilmadi</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50/60">
                <tr className="text-left text-brand-900">
                  <th className="px-4 py-3 font-semibold">Talaba</th>
                  {showUniversity && <th className="px-4 py-3 font-semibold">Universitet</th>}
                  <th className="px-4 py-3 font-semibold">Yo'nalish</th>
                  <th className="px-4 py-3 font-semibold">Holat</th>
                  {isMaster && <th className="px-4 py-3 font-semibold text-right">Ulush</th>}
                  <th className="px-4 py-3 font-semibold">Sana</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => {
                  const p = profiles[a.student_id] || {}
                  const l = ledger[a.id]
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
                      {showUniversity && <td className="px-4 py-3 text-slate-700">{uniById[a.university_id]?.code || a.university_id}</td>}
                      <td className="px-4 py-3 text-slate-700 max-w-56 truncate">{a.program_name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      {isMaster && (
                        <td className="px-4 py-3 text-right">
                          {l ? (
                            <div>
                              <p className="font-semibold text-apricot-700 whitespace-nowrap">{money(l.amount)}</p>
                              <CommissionBadge status={l.status} />
                            </div>
                          ) : <span className="text-slate-400">—</span>}
                        </td>
                      )}
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
        <ApplicationDrawer
          app={open}
          profile={profiles[open.student_id] || {}}
          flag={flags[open.id]}
          ledgerRow={ledger[open.id]}
          onClose={() => setOpenId(null)}
          onSaved={reload}
        />
      )}
    </div>
  )
}
