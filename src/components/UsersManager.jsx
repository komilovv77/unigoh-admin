import React from 'react';
import { ADMIN_ACCOUNTS } from '../data/admins';
import { useAdmin } from '../App';
import { Users, Shield, Building2, Key, Crown } from 'lucide-react';

export default function UsersManager() {
  const { currentAdmin, universities } = useAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-white">Admin Foydalanuvchilar</h2>
        <p className="text-slate-400 text-xs mt-0.5">Barcha login va parollar — maxfiy</p>
      </div>

      {/* Master Admin */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-3xl border border-indigo-800/40 p-6">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center text-white">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Master Admin (Platforma Asoschisi)</h3>
            <p className="text-[11px] text-slate-400">To'liq huquqlar — barcha OTM va ma'lumotlarga kirish</p>
          </div>
        </div>
        {ADMIN_ACCOUNTS.filter(a => a.role === 'master').map(acc => (
          <div key={acc.id} className="bg-slate-900/80 rounded-2xl border border-slate-700 p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center text-white font-bold text-sm`}>{acc.avatar}</div>
              <div>
                <div className="font-bold text-white text-sm">{acc.name}</div>
                <div className="text-[11px] text-slate-400">{acc.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Login</div>
                <code className="text-indigo-400 font-mono text-xs font-bold">{acc.username}</code>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Parol</div>
                <code className="text-amber-400 font-mono text-xs font-bold">{acc.password}</code>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">👑 Master Admin</span>
              <span className="text-slate-500">Barcha OTMlarga kirish huquqi</span>
            </div>
          </div>
        ))}
      </div>

      {/* University Admins */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">OTM Admin Foydalanuvchilari</h3>
            <p className="text-[11px] text-slate-400">Har bir OTM qabul komissiyasi uchun alohida kirish</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADMIN_ACCOUNTS.filter(a => a.role === 'university_admin').map(acc => {
            const uni = universities.find(u => u.id === acc.university);
            return (
              <div key={acc.id} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center text-white font-bold text-[11px]`}>{acc.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-xs truncate">{acc.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-900 rounded-xl px-3 py-2">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Login</div>
                    <code className="text-indigo-400 font-mono text-xs">{acc.username}</code>
                  </div>
                  <div className="bg-slate-900 rounded-xl px-3 py-2">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Parol</div>
                    <code className="text-amber-400 font-mono text-xs">{acc.password}</code>
                  </div>
                </div>
                {uni && (
                  <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{uni.name} — {uni.region}</span>
                  </div>
                )}
                <span className="inline-flex px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-semibold">
                  🏫 OTM Admin
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-300 space-y-1">
        <div className="font-bold flex items-center space-x-2"><Key className="w-3.5 h-3.5" /><span>Xavfsizlik eslatmasi</span></div>
        <p className="text-rose-400/70">Parollarni hech kimga ulashmang. Ishonchli brauzer yoki parol menejeri ishlatib saqlang. Ishlatilmagan OTM loginlarini o'chiring yoki almashtiring.</p>
      </div>
    </div>
  );
}
