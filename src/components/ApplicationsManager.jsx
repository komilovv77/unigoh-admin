import React, { useState, useMemo } from 'react';
import { useAdmin } from '../App';
import { FileText, Search, Filter, Download, Edit3, Save, X, MessageSquare } from 'lucide-react';

const STATUSES = [
  { value: 'PENDING', label: 'Kutilmoqda', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  { value: 'IN_REVIEW', label: "Ko'rilmoqda", color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  { value: 'EXAM_SCHEDULED', label: 'Imtihon belgilandi', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  { value: 'APPROVED', label: 'Qabul qilindi', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  { value: 'CONTRACT_ISSUED', label: "Shartnoma (To'langan)", color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  { value: 'REJECTED', label: 'Rad etildi', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30' },
];

export default function ApplicationsManager() {
  const { applications, currentAdmin, universities, updateApplicationStatus, notify } = useAdmin();
  const isMaster = currentAdmin?.role === 'master';

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterUni, setFilterUni] = useState('ALL');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [note, setNote] = useState('');

  const visibleApps = useMemo(() => {
    let list = isMaster ? applications : applications.filter(a => a.universityId === currentAdmin?.university);
    if (filterStatus !== 'ALL') list = list.filter(a => a.status === filterStatus);
    if (filterUni !== 'ALL') list = list.filter(a => a.universityId === filterUni);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.applicantName.toLowerCase().includes(q) ||
        a.applicantPhone.includes(q) ||
        a.applicantPinfl?.includes(q)
      );
    }
    return list;
  }, [applications, isMaster, currentAdmin, filterStatus, filterUni, search]);

  const handleExport = () => {
    const csv = [
      ['Ariza ID', 'Talaba', 'Telefon', 'PINFL', 'OTM', "Yo'nalish", 'Holat', 'Sana', 'Izoh'].join(','),
      ...visibleApps.map(a => [
        a.id, `"${a.applicantName}"`, a.applicantPhone, a.applicantPinfl,
        `"${a.universityName}"`, `"${a.programName}"`, a.status, a.submittedAt, `"${a.notes || ''}"`
      ].join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unigoh_arizalar_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    notify(`${visibleApps.length} ta ariza CSV ga eksport qilindi!`);
  };

  const getStatus = (val) => STATUSES.find(s => s.value === val) || STATUSES[0];

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">Arizalar & CRM</h2>
          <p className="text-slate-400 text-xs">{visibleApps.length} ta ariza ko'rsatilmoqda</p>
        </div>
        <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all border border-slate-600 self-start sm:self-auto">
          <Download className="w-4 h-4" />
          <span>Excel/CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ID, ism, telefon yoki PINFL..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
        >
          <option value="ALL">Barcha Holatlar</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {isMaster && (
          <select
            value={filterUni}
            onChange={e => setFilterUni(e.target.value)}
            className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
          >
            <option value="ALL">Barcha OTMlar</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => {
          const count = visibleApps.filter(a => a.status === s.value).length;
          if (!count) return null;
          return (
            <button
              key={s.value}
              onClick={() => setFilterStatus(filterStatus === s.value ? 'ALL' : s.value)}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${s.color} ${s.bg} ${s.border} ${filterStatus === s.value ? 'ring-2 ring-white/20' : ''}`}
            >
              <span>{s.label}</span>
              <span className="bg-white/10 rounded px-1">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Applications Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60">
                {['Ariza ID', 'Talaba', 'PINFL', 'OTM / Yo\'nalish', 'Holat', 'Sana', 'Amallar'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {visibleApps.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">Arizalar topilmadi</td></tr>
              ) : visibleApps.map(app => {
                const st = getStatus(app.status);
                const isEditingNote = editingNoteId === app.id;
                return (
                  <React.Fragment key={app.id}>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400 whitespace-nowrap">{app.id}</td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <div className="font-semibold text-white">{app.applicantName}</div>
                        <div className="text-slate-500 text-[11px]">{app.applicantPhone}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">{app.applicantPinfl}</td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <div className="text-white font-medium">{app.universityName}</div>
                        <div className="text-slate-400 text-[11px] line-clamp-1">{app.programName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={app.status}
                          onChange={e => updateApplicationStatus(app.id, e.target.value)}
                          className={`px-2 py-1 rounded-xl text-[11px] font-bold border bg-transparent focus:outline-none cursor-pointer ${st.color} ${st.bg} ${st.border}`}
                        >
                          {STATUSES.map(s => <option key={s.value} value={s.value} className="bg-slate-800 text-white">{s.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{app.submittedAt}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setEditingNoteId(isEditingNote ? null : app.id); setNote(app.notes || ''); }}
                          className={`p-1.5 rounded-xl transition-colors ${isEditingNote ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                          title="Izoh qo'shish"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                    {isEditingNote && (
                      <tr className="bg-slate-950/50">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <input
                              value={note}
                              onChange={e => setNote(e.target.value)}
                              placeholder="Izoh yozing (masalan: Hujjat to'liq emas, qayta talab qilindi)"
                              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => { updateApplicationStatus(app.id, app.status); notify('Izoh saqlandi'); setEditingNoteId(null); }}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                            >Saqlash</button>
                            <button onClick={() => setEditingNoteId(null)} className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
