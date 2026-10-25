import React, { useState } from 'react';
import { useAdmin } from '../App';
import { Lock, Eye, EyeOff, GraduationCap, ShieldAlert, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const { login, notify } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError("Login va parolni kiriting!"); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 800)); // Simulate auth delay
    const ok = login(username.trim(), password);
    if (!ok) {
      setError("Login yoki parol noto'g'ri! Iltimos, qayta urinib ko'ring.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo + Title */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-indigo-900/50">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              UniGoh <span className="text-indigo-400">Admin</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">unigohadmin.uz — Boshqaruv Markazi</p>
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
            <ShieldAlert className="w-3 h-3" />
            <span>Faqat vakolatli shaxslar uchun</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Admin Login / Foydalanuvchi nomi
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="komilovv77"
                autoComplete="username"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Maxfiy Parol
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-900/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Tizimga Kirish</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Hint section */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-500 text-center">
              OTM qabul komissiyalari uchun login/parolni UniGoh asoschi admin orqali oling
            </p>
            <div className="flex items-center justify-center">
              <a
                href="https://unigoh.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
              >
                <GraduationCap className="w-3 h-3" />
                <span>unigoh.uz asosiy saytga o'tish</span>
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          © 2026 UniGoh | AES-256 Xavfsiz Ulanish | SSL
        </p>
      </div>
    </div>
  );
}
