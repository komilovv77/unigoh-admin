import React, { useEffect, useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { loadProfiles } from '../lib/data'
import { dateTime } from '../lib/constants'
import { Card, PageTitle, ErrorBox, Empty, StatusBadge, btnSecondary } from '../components/ui'
import { go } from '../components/Shell'
import { useAdmin } from '../App'

// Universitet xodimi uchun: o'z universitetiga qabul qilingan talabalarning
// UniGoh bilan roziligi/shartnomasi holati va amaldagi shartnoma matni (faqat o'qish).
const STAGES = ['ADMITTED', 'SENT', 'CONTRACT', 'ENROLLED']

export default function UniContracts() {
  const { staff } = useAdmin()
  const [rows, setRows] = useState([])
  const [template, setTemplate] = useState(null)
  const [showText, setShowText] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const [{ data: apps, error }, { data: tpl }] = await Promise.all([
        supabase.from('applications').select('id, code, student_id, program_name, status, forwarded_at, updated_at')
          .eq('university_id', staff.university_id).in('status', STAGES).order('updated_at', { ascending: false }),
        supabase.from('contract_templates').select('version, title_uz, body_uz').eq('is_active', true).maybeSingle(),
      ])
      if (error) { setError(error.message); setLoading(false); return }
      const ids = [...new Set((apps || []).map((a) => a.student_id))]
      const [profiles, { data: agr }] = await Promise.all([
        loadProfiles(ids),
        ids.length ? supabase.from('student_agreements').select('student_id, template_version, signed_at').in('student_id', ids) : Promise.resolve({ data: [] }),
      ])
      const signed = {}
      for (const a of agr || []) if (!signed[a.student_id] || a.signed_at > signed[a.student_id].signed_at) signed[a.student_id] = a
      setRows((apps || []).map((a) => ({ ...a, profile: profiles[a.student_id] || {}, agreement: signed[a.student_id] })))
      setTemplate(tpl || null)
      setLoading(false)
    })()
  }, [])

  const waiting = rows.filter((r) => r.status === 'ADMITTED').length

  return (
    <div className="space-y-6">
      <PageTitle
        title="Talaba shartnomasi"
        subtitle="Qabul qilingan talabalaringiz UniGoh orqali rozilik berganmi — shu yerda ko'rinadi"
      />

      <Card className="p-5 space-y-2 text-sm text-slate-700">
        <p><b>Jarayon:</b> siz talabani qabul qilasiz → talaba saytda rozilik beradi{template ? ' va UniGoh shartnomasini imzolaydi' : ''} → sizga SMS keladi, telefon raqami ochiladi → talabaga qo'ng'iroq qilib, universitet shartnomasini tuzasiz → holatni "Shartnoma tuzildi", to'lovdan keyin "To'lov qildi" deb belgilaysiz.</p>
        {waiting > 0 && <p className="text-apricot-800 font-semibold">{waiting} ta talaba hali rozilik bermagan.</p>}
        {template ? (
          <button onClick={() => setShowText(!showText)} className={btnSecondary}>{showText ? 'Yopish' : `UniGoh–talaba shartnomasi matni (${template.version}-versiya)`}</button>
        ) : (
          <p className="text-slate-500">UniGoh–talaba shartnomasi hali e'lon qilinmagan: talabalar oddiy rozilik bilan yuboriladi.</p>
        )}
        {showText && template && (
          <div className="mt-2 p-4 rounded-xl bg-cream border border-apricot-100 whitespace-pre-line max-h-96 overflow-y-auto">{template.body_uz}</div>
        )}
      </Card>

      <ErrorBox error={error} />

      <Card className="overflow-hidden">
        {loading ? <Empty>Yuklanmoqda...</Empty> : rows.length === 0 ? <Empty>Hozircha qabul qilingan talaba yo'q</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50/60">
                <tr className="text-left text-brand-900">
                  <th className="px-4 py-3 font-semibold">Talaba</th>
                  <th className="px-4 py-3 font-semibold">Ariza</th>
                  <th className="px-4 py-3 font-semibold">Holat</th>
                  <th className="px-4 py-3 font-semibold">Rozilik</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => go('student', { id: r.student_id })} className="border-t border-brand-50 cursor-pointer hover:bg-cream align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-900">{r.profile.full_name || 'Ism kiritilmagan'}</p>
                      <p className="text-xs text-slate-500">{r.profile.phone || 'Telefon rozilikdan keyin ochiladi'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.code}<br /><span className="text-xs">{r.program_name}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.forwarded_at ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> {dateTime(r.forwarded_at)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-apricot-800"><Clock className="w-4 h-4" /> Kutilmoqda</span>
                      )}
                      {r.agreement && <p className="text-xs text-slate-500 mt-1">Shartnoma imzolangan: {dateTime(r.agreement.signed_at)}</p>}
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
