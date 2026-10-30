import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from './lib/supabase'
import Login from './components/Login'
import Shell from './components/Shell'
import { LogoMark, btnSecondary, btnPrimary, inputCls, ErrorBox } from './components/ui'

const AdminContext = createContext(null)
export const useAdmin = () => useContext(AdminContext)

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = yuklanmoqda
  const [staff, setStaff] = useState(undefined)
  const [universities, setUniversities] = useState([])
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, s) => { setSession(s); if (e === 'PASSWORD_RECOVERY') setRecovering(true) })
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

  if (recovering) return <Centered><NewPassword onDone={() => setRecovering(false)} /></Centered>

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

function NewPassword({ onDone }) {
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault()
    setError('')
    if (p1 !== p2) return setError('Parollar bir xil emas.')
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: p1 })
    setBusy(false)
    if (error) return setError(error.message)
    onDone()
  }
  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <h1 className="text-xl font-bold text-brand-900 text-center">Yangi parol o'rnating</h1>
      <input type="password" required minLength={8} autoComplete="new-password" placeholder="Yangi parol (kamida 8 belgi)" className={inputCls} value={p1} onChange={(e) => setP1(e.target.value)} />
      <input type="password" required minLength={8} autoComplete="new-password" placeholder="Yana bir marta" className={inputCls} value={p2} onChange={(e) => setP2(e.target.value)} />
      <ErrorBox error={error} />
      <button className={`${btnPrimary} w-full py-3`} disabled={busy}>{busy ? 'Saqlanmoqda...' : 'Saqlash'}</button>
    </form>
  )
}
