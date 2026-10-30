import React, { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { inputCls, btnPrimary, btnSecondary, ErrorBox } from './ui'

// Admin panelga ikki bosqichli kirish (Google Authenticator va shunga o'xshash ilovalar).
// Baza ham xodim ma'lumotlarini faqat ikkinchi bosqichdan o'tgan sessiyaga beradi.
export default function Mfa({ onVerified }) {
  const [state, setState] = useState('loading') // loading | enroll | verify
  const [factorId, setFactorId] = useState(null)
  const [qr, setQr] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) { setError(error.message); setState('verify'); return }
      const verified = (data.totp || []).find((f) => f.status === 'verified')
      if (verified) { setFactorId(verified.id); setState('verify'); return }
      // Avvalgi tugallanmagan urinishlarni tozalash
      for (const f of data.all || []) if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id })
      const r = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `UniGoh ${new Date().toISOString().slice(0, 10)}` })
      if (r.error) { setError(r.error.message); setState('enroll'); return }
      setFactorId(r.data.id)
      setQr(r.data.totp.qr_code)
      setSecret(r.data.totp.secret)
      setState('enroll')
    })()
  }, [])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.replace(/\s/g, '') })
    setBusy(false)
    if (error) { setError(error.message.toLowerCase().includes('invalid') ? "Kod noto'g'ri yoki eskirgan. Ilovadagi yangi kodni kiriting." : error.message); setCode(''); return }
    onVerified()
  }

  if (state === 'loading') return <p className="text-slate-500">Yuklanmoqda...</p>

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <div className="flex items-center gap-2 justify-center text-brand-900">
        <ShieldCheck className="w-6 h-6" />
        <h1 className="text-xl font-bold">{state === 'enroll' ? 'Ikki bosqichli himoyani yoqing' : 'Tasdiqlash kodi'}</h1>
      </div>

      {state === 'enroll' ? (
        <>
          <ol className="text-sm text-slate-700 list-decimal pl-5 space-y-1">
            <li>Telefoningizga <b>Google Authenticator</b> yoki <b>Microsoft Authenticator</b> ilovasini o'rnating.</li>
            <li>Ilovada "+" bosib, quyidagi QR kodni skanerlang.</li>
            <li>Ilova ko'rsatgan 6 xonali kodni kiriting.</li>
          </ol>
          {qr && <img src={qr} alt="Authenticator uchun QR kod" className="mx-auto w-48 h-48 bg-white p-2 rounded-xl border border-brand-100" />}
          {secret && (
            <p className="text-xs text-slate-500 text-center break-all">
              Skaner ishlamasa, kalitni qo'lda kiriting: <code className="font-mono text-slate-800">{secret}</code>
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-700 text-center">Authenticator ilovasidagi UniGoh uchun 6 xonali kodni kiriting.</p>
      )}

      <input
        className={`${inputCls} text-center text-2xl tracking-[0.4em] font-mono`}
        inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="\d{6}" required autoFocus
        value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" aria-label="6 xonali kod"
      />
      <ErrorBox error={error} />
      <button className={`${btnPrimary} w-full py-3`} disabled={busy || code.length !== 6}>{busy ? 'Tekshirilmoqda...' : 'Tasdiqlash'}</button>
      <button type="button" onClick={() => supabase.auth.signOut()} className={`${btnSecondary} w-full`}>Chiqish</button>
      <p className="text-xs text-slate-500 text-center">Telefoningizni yo'qotsangiz, bosh administrator himoyani qayta o'rnatib beradi.</p>
    </form>
  )
}
