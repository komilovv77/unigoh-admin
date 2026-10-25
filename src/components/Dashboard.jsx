import React from 'react';
import { useAdmin } from '../App';
import { INITIAL_UNIVERSITIES } from '../data/universities';
import { 
  TrendingUp, Users, FileText, Building2, CheckCircle2, Clock, 
  XCircle, AlertTriangle, Award, Download, RefreshCw
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING: { label: "Kutilmoqda", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
  IN_REVIEW: { label: "Ko'rilmoqda", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
  EXAM_SCHEDULED: { label: "Imtihon belgilandi", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30" },
  APPROVED: { label: "Qabul qilindi", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  CONTRACT_ISSUED: { label: "Shartnoma (To'langan)", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" },
  REJECTED: { label: "Rad etildi", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/30" },
};

export default function Dashboard() {
  const { universities, applications, currentAdmin, notify } = useAdmin();
  const isMaster = currentAdmin?.role === 'master';

  // Filter applications for OTM admin
  const visibleApps = isMaster
    ? applications
    : applications.filter(a => a.universityId === currentAdmin?.university);

  const stats = {
    total: visibleApps.length,
    pending: visibleApps.filter(a => a.status === 'PENDING').length,
    inReview: visibleApps.filter(a => a.status === 'IN_REVIEW').length,
    approved: visibleApps.filter(a => ['APPROVED', 'CONTRACT_ISSUED'].includes(a.status)).length,
    rejected: visibleApps.filter(a => a.status === 'REJECTED').length,
    paid: visibleApps.filter(a => a.status === 'CONTRACT_ISSUED').length,
  };

  const totalRevenue = isMaster
    ? universities.reduce((acc, u) => acc + (u.tariffPrice || 0), 0)
    : 0;
  const commission = stats.paid * 1500000;

  const handleExport = () => {
    const csv = [
      ['Ariza ID', 'Talaba F.I.SH', 'Telefon', 'PINFL', 'OTM', "Yo'nalish", 'Holat', 'Sana'].join(','),
      ...visibleApps.map(a => [
        a.id, a.applicantName, a.applicantPhone, a.applicantPinfl,
        a.universityName, a.programName, a.status, a.submittedAt
      ].join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unigoh_arizalar_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    notify('CSV fayl yuklab olindi!');
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-slate-800/50 rounded-3xl border border-indigo-800/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">
            Salom, {currentAdmin?.name}! 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isMaster
              ? `UniGoh platformasi — ${universities.length} ta OTM, ${applications.length} ta ariza`
              : `${universities.find(u => u.id === currentAdmin?.university)?.name || 'OTM'} — sizning arizalaringiz`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all border border-slate-600">
            <Download className="w-3.5 h-3.5" />
            <span>CSV Yuklab olish</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 ${isMaster ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        <StatCard label="Jami Arizalar" value={stats.total} icon={FileText} color="text-indigo-400" bg="bg-indigo-400/10" />
        <StatCard label="Kutilmoqda" value={stats.pending} icon={Clock} color="text-amber-400" bg="bg-amber-400/10" />
        <StatCard label="Qabul qilindi" value={stats.approved} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-400/10" />
        <StatCard label="Rad etildi" value={stats.rejected} icon={XCircle} color="text-rose-400" bg="bg-rose-400/10" />
        {isMaster && (
          <>
            <StatCard label="To'langan Shartnomalar" value={stats.paid} icon={Award} color="text-green-400" bg="bg-green-400/10" />
            <StatCard label="Hamkor OTMlar" value={universities.length} icon={Building2} color="text-blue-400" bg="bg-blue-400/10" />
            <StatCard label="OTM Obuna Daromadi" value={`${(totalRevenue/1000000).toFixed(0)} mln`} icon={TrendingUp} color="text-purple-400" bg="bg-purple-400/10" />
            <StatCard label="Komissiya (1.5mln×)" value={`${(commission/1000000).toFixed(1)} mln`} icon={TrendingUp} color="text-amber-400" bg="bg-amber-400/10" />
          </>
        )}
      </div>

      {/* Recent Applications */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>So'nggi Arizalar</span>
          </h3>
          <span className="text-xs text-slate-400">{visibleApps.length} ta jami</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                {['Ariza ID', 'Talaba', 'OTM & Yo\'nalish', 'Holat', 'Sana'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {visibleApps.slice(0, 10).map(app => {
                const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-400 whitespace-nowrap">{app.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{app.applicantName}</div>
                      <div className="text-slate-500 text-[11px]">{app.applicantPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{app.universityName}</div>
                      <div className="text-slate-400 text-[11px]">{app.programName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${st.color} ${st.bg} ${st.border}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{app.submittedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* University breakdown (Master only) */}
      {isMaster && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>OTMlar bo'yicha Ariza Taqsimoti</span>
          </h3>
          <div className="space-y-3">
            {universities.map(u => {
              const count = applications.filter(a => a.universityId === u.id).length;
              const pct = applications.length ? Math.round((count / applications.length) * 100) : 0;
              return (
                <div key={u.id} className="flex items-center space-x-3">
                  <div className="w-32 text-xs text-slate-300 font-medium truncate shrink-0">{u.name}</div>
                  <div className="flex-1 bg-slate-800 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs font-bold text-slate-300 w-12 text-right">{count} ta</div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                    u.tariffTier.includes('Paket B') ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-300'
                  }`}>{u.tariffTier.split(' ')[0] + ' ' + u.tariffTier.split(' ')[1]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-xs text-slate-400 font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
}
