import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

// Arizalar + talaba profillari (+ master uchun komissiya).
// RLS tufayli OTM xodimi faqat o'z universiteti arizalarini va talabalarini oladi,
// komissiya jadvallari esa unga umuman qaytmaydi.
export function useApplications({ isMaster = false, universityId = null, studentId = null } = {}) {
  const [apps, setApps] = useState([])
  const [profiles, setProfiles] = useState({})
  const [flags, setFlags] = useState({})
  const [ledger, setLedger] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    let q = supabase.from('applications').select('*').order('created_at', { ascending: false })
    if (universityId) q = q.eq('university_id', universityId)
    if (studentId) q = q.eq('student_id', studentId)
    const [{ data: a, error: e1 }, { data: f }, l] = await Promise.all([
      q,
      supabase.from('application_flags').select('id, flag').not('flag', 'is', null),
      isMaster ? supabase.from('commission_ledger').select('*') : Promise.resolve({ data: [] }),
    ])
    if (e1) {
      setError(e1.message)
      setLoading(false)
      return
    }
    const ids = [...new Set((a || []).map((x) => x.student_id))]
    setProfiles(await loadProfiles(ids))
    setApps(a || [])
    setFlags(Object.fromEntries((f || []).map((x) => [x.id, x.flag])))
    setLedger(Object.fromEntries((l.data || []).map((x) => [x.application_id, x])))
    setLoading(false)
  }, [isMaster, universityId, studentId])

  useEffect(() => { load() }, [load])

  return { apps, profiles, flags, ledger, loading, error, reload: load }
}

export const PROFILE_COLS =
  'id, full_name, phone, region, bio, school_name, diploma_url, test_score, certificates, portfolio_url, updated_at'

export async function loadProfiles(ids) {
  if (!ids.length) return {}
  const { data } = await supabase.from('profiles').select(PROFILE_COLS).in('id', ids)
  return Object.fromEntries((data || []).map((x) => [x.id, x]))
}

export function useLedger() {
  const [rows, setRows] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('commission_ledger').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    setRows(data || [])
    setProfiles(await loadProfiles([...new Set((data || []).map((r) => r.student_id))]))
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])
  return { rows, profiles, loading, error, reload: load }
}

export function useTerms(enabled) {
  const [terms, setTerms] = useState({})
  const load = useCallback(async () => {
    if (!enabled) return
    const { data } = await supabase.from('university_terms').select('*')
    setTerms(Object.fromEntries((data || []).map((t) => [t.university_id, t])))
  }, [enabled])
  useEffect(() => { load() }, [load])
  return { terms, reload: load }
}
