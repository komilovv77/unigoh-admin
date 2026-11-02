import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAdmin } from '../App'

// Applications + student profiles (+ commissions for master).
// Thanks to RLS, university staff only receive their own university's applications and students;
// commission tables never reach them.
export function useApplications({ isMaster = false, universityId = null, studentId = null } = {}) {
  const [apps, setApps] = useState([])
  const [profiles, setProfiles] = useState({})
  const [flags, setFlags] = useState({})
  const [ledger, setLedger] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // University staff only see their own university's applications (even if the same
  // account applied elsewhere as a student)
  const { staff } = useAdmin()
  const ownUni = isMaster ? null : staff?.university_id || '__none__'

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    let q = supabase.from('applications').select('*').order('created_at', { ascending: false })
    if (universityId) q = q.eq('university_id', universityId)
    if (ownUni) q = q.eq('university_id', ownUni)
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
  }, [isMaster, universityId, studentId, ownUni])

  useEffect(() => { load() }, [load])

  return { apps, profiles, flags, ledger, loading, error, reload: load }
}

export const PROFILE_COLS =
  'id, full_name, phone, region, bio, school_name, diploma_url, test_score, certificates, portfolio_url, documents, updated_at'

// Profiles: phone visible to university staff only after the student consents
export async function loadProfiles(ids) {
  if (!ids.length) return {}
  const { data } = await supabase.rpc('applicant_profiles', { p_ids: ids })
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
