import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogoMark, inputCls, btnPrimary, ErrorBox } from './ui'

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError(''); setInfo('')
    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
      if (error) setError(error.message)
      else setInfo("Agar bu email ro'yxatdan o'tgan bo'lsa, unga parolni tiklash havolasi yuborildi.")
    } else if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message === 'Invalid login credentials' ? "Email yoki parol noto'g'ri" : error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin } })
      if (error) setError(error.message)
      else if (!data.session) setInfo("Emailingizga tasdiqlash xati yuborildi. Tasdiqlang, so'ng kiring.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-brand-800 text-white p-12 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <LogoMark className="w-10 h-10" />
          <span className="text-2xl font-extrabold">uni<span className="text-apricot-400">goh</span></span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold leading-tight">Boshqaruv paneli</h1>
          <p className="mt-4 text-lg text-brand-100 max-w-sm">
            Arizalar, talabalar va hamkor universitetlar bilan hisob-kitob bir joyda.
          </p>
        </div>
        <p className="text-sm text-brand-200">Vodiydan boshlandi.</p>
        <svg viewBox="0 0 140 140" className="absolute -right-16 -bottom-16 w-96 h-96" aria-hidden="true">
          <path d="M38 140 V72 A32 32 0 0 1 102 72 V140" fill="none" stroke="#FEF3C7" strokeOpacity="0.12" strokeWidth="14" strokeLinecap="round" />
          <circle cx="70" cy="92" r="12" fill="#F59E0B" fillOpacity="0.85" />
        </svg>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <LogoMark className="w-12 h-12 lg:hidden" />
          <div>
            <h2 className="text-2xl font-extrabold text-brand-900">{mode === 'signin' ? 'Kirish' : mode === 'reset' ? 'Parolni tiklash' : "Xodim sifatida ro'yxatdan o'tish"}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {mode === 'signin'
                ? 'UniGoh jamoasi va hamkor universitetlar uchun.'
                : "Ro'yxatdan o'tgach, administrator sizni universitetingizga biriktiradi."}
            </p>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-brand-900 mb-1.5">Ism va familiya</label>
              <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-brand-900 mb-1.5">Email</label>
            <input type="email" autoComplete="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {mode !== 'reset' && <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-sm font-semibold text-brand-900">Parol</label>
              {mode === 'signin' && <button type="button" onClick={() => { setMode('reset'); setError(''); setInfo('') }} className="text-sm font-semibold text-brand-700 hover:text-brand-900">Parolni unutdingizmi?</button>}
            </div>
            <input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>}

          <ErrorBox error={error} />
          {info && <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">{info}</div>}

          <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-3`}>
            {loading ? 'Kuting...' : mode === 'signin' ? 'Kirish' : mode === 'reset' ? 'Havola yuborish' : "Ro'yxatdan o'tish"}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo('') }}
            className="w-full text-sm text-brand-700 hover:text-brand-900 font-medium"
          >
            {mode === 'signin' ? "Universitet xodimimisiz? Ro'yxatdan o'ting" : 'Kirish sahifasiga qaytish'}
          </button>
        </form>
      </div>
    </div>
  )
}
