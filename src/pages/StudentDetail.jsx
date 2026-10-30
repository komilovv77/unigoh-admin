import React, { useEffect, useState } from 'react'
import { ArrowLeft, Phone, MapPin, School, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { useApplications } from '../lib/data'
import { dateTime, money } from '../lib/constants'
import { Card, StatusBadge, CommissionBadge, Empty } from '../components/ui'
import ApplicationDrawer, { Documents, Field } from '../components/ApplicationDrawer'

export default function StudentDetail({ params }) {
  const { isMaster, uniById } = useAdmin()
  const id = params.get('id')
  const data = useApplications({ isMaster, studentId: id })
  const [email, setEmail] = useState('')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    supabase.rpc('student_directory').then(({ data }) => setEmail((data || []).find((d) => d.id === id)?.email || ''))
  }, [id])

  const p = data.profiles[id] || {}
  const open = data.apps.find((a) => a.id === openId)

  if (data.loading) return <p className="text-slate-500">Yuklanmoqda...</p>
  if (!data.profiles[id] && data.apps.length === 0 && !email) return <Empty>Talaba topilmadi yoki uni ko'rishga ruxsatingiz yo'q.</Empty>

  return (
    <div className="space-y-6">
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-800 text-white text-2xl font-extrabold shrink-0">
            {(p.full_name || email || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-brand-900">{p.full_name || 'Ism kiritilmagan'}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
              {p.phone && <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 hover:text-brand-800"><Phone className="w-3.5 h-3.5" /> {p.phone}</a>}
              {email && <a href={`mailto:${email}`} className="inline-flex items-center gap-1 hover:text-brand-800"><Mail className="w-3.5 h-3.5" /> {email}</a>}
              {p.region && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.region}</span>}
              {p.school_name && <span className="inline-flex items-center gap-1"><School className="w-3.5 h-3.5" /> {p.school_name}</span>}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-brand-900">Profil va hujjatlar</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field k="DTM / kirish bali" v={p.test_score} />
            <Field k="Profil yangilangan" v={p.updated_at ? dateTime(p.updated_at) : null} />
          </dl>
          {p.bio && <p className="mt-4 text-sm text-slate-700 p-3 rounded-xl bg-cream">{p.bio}</p>}
          <Documents profile={p} />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-brand-900">Arizalar</h2>
          {!isMaster && <p className="text-xs text-slate-500 mt-1">Faqat universitetingizga berilgan arizalar ko'rinadi.</p>}
          {data.apps.length === 0 ? <p className="mt-4 text-sm text-slate-500">Arizalar yo'q</p> : (
            <ul className="mt-4 space-y-2">
              {data.apps.map((a) => {
                const l = data.ledger[a.id]
                return (
                  <li key={a.id}>
                    <button onClick={() => setOpenId(a.id)} className="w-full text-left p-3.5 rounded-xl border border-brand-100 hover:border-brand-300 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-brand-900 truncate">{uniById[a.university_id]?.name || a.university_id}</p>
                          <p className="text-xs text-slate-500 truncate">{a.code} · {a.program_name}</p>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                      {isMaster && l && (
                        <p className="mt-2 flex items-center gap-2 text-sm">
                          <span className="font-semibold text-apricot-700">{money(l.amount)}</span>
                          <CommissionBadge status={l.status} />
                        </p>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {open && (
        <ApplicationDrawer
          app={open}
          profile={p}
          flag={data.flags[open.id]}
          ledgerRow={data.ledger[open.id]}
          onClose={() => setOpenId(null)}
          onSaved={data.reload}
        />
      )}
    </div>
  )
}
