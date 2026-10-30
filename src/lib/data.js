import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

// Arizalar + talaba profillari. RLS tufayli OTM admini faqat o'z arizalarini oladi.
export function useApplications() {
  const [apps, setApps] = useState([])
  const [profiles, setProfiles] = useState({})
  const [flags, setFlags] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [{ data: a, error: e1 }, { data: f }] = await Promise.all([
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('application_flags').select('id, flag').not('flag', 'is', null),
    ])
    if (e1) {
      setError(e1.message)
      setLoading(false)
      return
    }
    const ids = [...new Set((a || []).map((x) => x.student_id))]
    let pmap = {}
    if (ids.length) {
      const { data: p } = await supabase
        .from('profiles')
        .select('id, full_name, phone, region, school_name, test_score, certificates, diploma_url, bio, portfolio_url')
        .in('id', ids)
      pmap = Object.fromEntries((p || []).map((x) => [x.id, x]))
    }
    setApps(a || [])
    setProfiles(pmap)
    setFlags(Object.fromEntries((f || []).map((x) => [x.id, x.flag])))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { apps, profiles, flags, loading, error, reload: load }
}
