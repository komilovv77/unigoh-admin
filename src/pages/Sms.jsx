import React, { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { dateTime } from '../lib/constants'
import { Card, PageTitle, ErrorBox, Empty, btnSecondary } from '../components/ui'

const STATUS = {
  queued: { label: 'Navbatda', cls: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Yuborildi', cls: 'bg-emerald-50 text-emerald-700' },
  failed: { label: 'Xato', cls: 'bg-red-50 text-red-700' },
  invalid: { label: "Raqam noto'g'ri", cls: 'bg-apricot-100 text-apricot-800' },
  skipped: { label: "O'tkazildi", cls: 'bg-slate-100 text-slate-500' },
}

export default function Sms() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('sms_outbox').select('*').order('id', { ascending: false }).limit(200)
    if (error) setError(error.message)
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function retry() {
    setError(''); setInfo('')
    const { data, error } = await supabase.rpc('sms_retry', { p_id: null })
    if (error) setError(error.message === 'SMS hali sozlanmagan' ? "SMS hali sozlanmagan: Eskiz ma'lumotlarini Vercel'ga va sir so'zni Supabase'ga kiritish kerak." : error.message)
    else setInfo(`${data} ta SMS qayta yuborildi`)
    setTimeout(load, 2500)
  }

  const waiting = rows.filter((r) => r.status === 'queued' || r.status === 'failed').length

  return (
    <div className="space-y-6">
      <PageTitle
        title="SMS jurnali"
        subtitle="Talabalarga (javob chiqqanda) va universitetlarga (talaba yuborilganda) ketgan SMS'lar"
        action={<button onClick={retry} disabled={!waiting} className={btnSecondary}><RefreshCw className="w-4 h-4" /> Navbatdagilarni yuborish ({waiting})</button>}
      />
      <ErrorBox error={error} />
      {info && <p className="text-sm font-semibold text-emerald-700">{info}</p>}
      <Card className="overflow-hidden">
        {loading ? <Empty>Yuklanmoqda...</Empty> : rows.length === 0 ? <Empty>Hozircha SMS yo'q</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50/60">
                <tr className="text-left text-brand-900">
                  <th className="px-4 py-3 font-semibold">Sana</th>
                  <th className="px-4 py-3 font-semibold">Kimga</th>
                  <th className="px-4 py-3 font-semibold">Matn</th>
                  <th className="px-4 py-3 font-semibold">Holat</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-brand-50 align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{dateTime(r.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-brand-900">{r.recipient === 'university' ? 'Universitet' : 'Talaba'}</p>
                      <p className="text-xs text-slate-500">{r.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 min-w-64 text-slate-700">{r.body}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS[r.status]?.cls}`}>{STATUS[r.status]?.label || r.status}</span>
                      {r.error && <p className="mt-1 text-xs text-red-600 max-w-56">{r.error}</p>}
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
