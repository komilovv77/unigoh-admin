import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from './lib/supabase'
import Login from './components/Login'
import Shell from './components/Shell'
import { LogoMark, btnSecondary } from './components/ui'

const AdminContext = createContext(null)
export const useAdmin = () => useContext(AdminContext)

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = yuklanmoqda
  const [staff, setStaff] = useState(undefined)
  const [universities, setUniversities] = useState([])

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const loadUniversities = useCallback(async () => {
    const { data } = await supabase.from('universities').select('*').order('name')
    setUniversities(data || [])
  }, [])

  useEffect(() => {
    if (!session) { setStaff(session === null ? null : undefined); return }
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.from('staff').select('*').eq('user_id', session.user.id).maybeSingle()
      if (cancelled) return
      setStaff(data || null)
      if (data) loadUniversities()
    })()
    return () => { cancelled = true }
  }, [session, loadUniversities])

  if (!isConfigured) {
    return (
      <Centered>
        <h1 className="text-xl font-bold text-brand-900">Sozlama yetishmayapti</h1>
        <p className="mt-2 text-slate-600">
          Vercel → Settings → Environment Variables ga asosiy sayt bilan bir xil
          <code className="mx-1 px-1.5 py-0.5 bg-brand-50 rounded">VITE_SUPABASE_URL</code> va
          <code className="mx-1 px-1.5 py-0.5 bg-brand-50 rounded">VITE_SUPABASE_ANON_KEY</code> ni qo'shing, keyin Redeploy qiling.
        </p>
      </Centered>
    )
  }

  if (session === undefined || (session && staff === undefined)) {
    return <Centered><p className="text-slate-500">Yuklanmoqda...</p></Centered>
  }

  if (!session) return <Login />

  if (!staff) {
    return (
      <Centered>
        <h1 className="text-xl font-bold text-brand-900">Kirish huquqi hali berilmagan</h1>
        <p className="mt-2 text-slate-600">
          <b>{session.user.email}</b> akkaunti yaratildi. UniGoh administratori sizni universitetingizga biriktirgandan so'ng panel ochiladi.
        </p>
        <button className={`${btnSecondary} mt-6`} onClick={() => supabase.auth.signOut()}>Chiqish</button>
      </Centered>
    )
  }

  const uniById = Object.fromEntries(universities.map((u) => [u.id, u]))
  const value = {
    session,
    staff,
    isMaster: staff.role === 'master',
    universities,
    uniById,
    reloadUniversities: loadUniversities,
  }

  return (
    <AdminContext.Provider value={value}>
      <Shell />
    </AdminContext.Provider>
  )
}

function Centered({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-brand-100 p-8 text-center">
        <LogoMark className="w-14 h-14 mx-auto mb-5" />
        {children}
      </div>
    </div>
  )
}
