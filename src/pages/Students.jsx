import React, { useEffect, useMemo, useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { loadProfiles } from '../lib/data'
import { date } from '../lib/constants'
import { Card, PageTitle, ErrorBox, Empty, inputCls, StatusBadge } from '../components/ui'
import { go } from '../components/Shell'

export default function Students({ params }) {
  const { isMaster, uniById } = useAdmin()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState(params.get('q') || '')
  const [uni, setUni] = useState('')

  useEffect(() => { setQ(params.get('q') || '') }, [params])

  useEffect(() => {
    (async () => {
      setLoading(true)
      const [{ data: dir, error }, { data: apps }] = await Promise.all([
        supabase.rpc('student_directory'),
        supabase.from('applications').select('id, student_id, university_id, status, created_at').order('created_at', { ascending: false }),
      ])
      if (error) { setError(error.message); setLoading(false); return }
      const profiles = await loadProfiles((dir || []).map((d) => d.id))
      const byStudent = {}
      for (const a of apps || []) (byStudent[a.student_id] ||= []).push(a)
      setRows((dir || []).map((d) => ({ ...d, profile: profiles[d.id] || {}, apps: byStudent[d.id] || [] }))
        .sort((a, b) => new Date(b.apps[0]?.created_at || b.created_at) - new Date(a.apps[0]?.created_at || a.created_at)))
      setLoading(false)
    })()
  }, [])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (uni && !r.apps.some((a) => a.university_id === uni)) return false
      if (!s) return true
      const p = r.profile
      return [p.full_name, p.phone, r.email, p.region, p.school_name].some((v) => String(v || '').toLowerCase().includes(s))
    })
  }, [rows, q, uni])

  return (
    <div>
      <PageTitle
        title="Talabalar"
        subtitle={isMaster ? `Platformadagi barcha talabalar: ${rows.length}` : `Universitetingizga ariza bergan talabalar: ${rows.length}`}
      />
      <Card className="p-4 mb-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_260px]">
          <label className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input autoFocus className={`${inputCls} pl-10`} placeholder="Ism, telefon, email, viloyat yoki maktab" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {isMaster && (
            <select className={inputCls} value={uni} onChange={(e) => setUni(e.target.value)}>
              <option value="">Barcha universitetlar</option>
              {Object.values(uniById).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
        </div>
      </Card>
      <ErrorBox error={error} />
      <Card className="overflow-hidden">
        {loading ? <Empty>Yuklanmoqda...</Empty> : list.length === 0 ? <Empty>Talaba topilmadi</Empty> : (
          <ul className="divide-y divide-brand-50">
            {list.map((r) => (
              <li key={r.id}>
                <button onClick={() => go('student', { id: r.id })} className="w-full text-left px-4 py-3.5 hover:bg-cream flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-100 text-brand-800 font-bold shrink-0">
                    {(r.profile.full_name || r.email || '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-brand-900 truncate">{r.profile.full_name || 'Ism kiritilmagan'}</span>
                    <span className="block text-xs text-slate-500 truncate">{r.profile.phone || '—'} · {r.email} · {r.profile.region || '—'}</span>
                  </span>
                  <span className="hidden md:flex flex-wrap gap-1.5 justify-end max-w-xs">
                    {r.apps.length === 0
                      ? <span className="text-xs text-slate-400">Ariza yo'q · {date(r.created_at)}</span>
                      : r.apps.slice(0, 3).map((a) => (
                        <span key={a.id} className="inline-flex items-center gap-1 text-xs">
                          <span className="font-semibold text-slate-600">{uniById[a.university_id]?.code}</span>
                          <StatusBadge status={a.status} />
                        </span>
                      ))}
                  </span>
                  <ChevronRight className="w-5 h-5 text-brand-300 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
