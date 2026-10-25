import React, { useState } from 'react';
import { useAdmin } from '../App';
import { 
  Building2, Edit3, Trash2, Plus, Save, X, Eye, EyeOff, 
  ChevronDown, ChevronUp, Star, MapPin, Phone, Globe, Mail
} from 'lucide-react';

export default function UniversityManager() {
  const { universities, updateUniversity, addUniversity, deleteUniversity, currentAdmin, notify } = useAdmin();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUni, setNewUni] = useState(getEmptyUni());
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  function getEmptyUni() {
    return {
      name: '', fullName: '', shortDescription: '', region: 'Andijon', city: '',
      founded: 2024, studentCount: 0, tuitionFeeMin: 10000000, tuitionFeeMax: 20000000,
      grantOpportunity: '', applicationDeadline: '', coverImage: '',
      tariffTier: 'Paket A (Standard)', tariffPrice: 3000000,
      ranking: { localRank: 10, ratingScore: 9.0, qsStars: 3 },
      languages: ["O'zbek"], website: '', phone: '', email: '',
      programs: [{ id: 'prog-1', name: '', degree: 'Bakalavr', duration: '4 yil', tuition: 10000000 }],
      features: [''], isActive: true, code: ''
    };
  }

  const startEdit = (uni) => {
    setEditingId(uni.id);
    setEditData({ ...uni });
  };

  const saveEdit = () => {
    updateUniversity(editingId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleAdd = () => {
    if (!newUni.name || !newUni.code) { notify('OTM nomi va kodi kiritilishi shart!', 'warning'); return; }
    addUniversity(newUni);
    setNewUni(getEmptyUni());
    setShowAddForm(false);
  };

  const Field = ({ label, value, onChange, type = 'text', ...props }) => (
    <div>
      <label className="block text-[11px] font-semibold text-slate-400 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          {...props}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">OTMlar Boshqaruvi</h2>
          <p className="text-slate-400 text-xs mt-0.5">{universities.length} ta OTM ro'yxatda</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-900/40"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi OTM Qo'shish</span>
        </button>
      </div>

      {/* Add New University Form */}
      {showAddForm && (
        <div className="bg-slate-900 rounded-3xl border border-indigo-800/40 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Yangi OTM Qo'shish</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="OTM Qisqa Nomi *" value={newUni.name} onChange={v => setNewUni({...newUni, name: v})} placeholder="ISFT Institute" />
            <Field label="OTM Kodi *" value={newUni.code} onChange={v => setNewUni({...newUni, code: v.toUpperCase()})} placeholder="ISFT" />
            <Field label="Hudud (Viloyat)" value={newUni.region} onChange={v => setNewUni({...newUni, region: v})} />
            <Field label="Shahar / Manzil" value={newUni.city} onChange={v => setNewUni({...newUni, city: v})} />
            <Field label="Minimal Kontrakt (UZS)" value={newUni.tuitionFeeMin} onChange={v => setNewUni({...newUni, tuitionFeeMin: Number(v)})} type="number" />
            <Field label="Reklam muddati (Deadline)" value={newUni.applicationDeadline} onChange={v => setNewUni({...newUni, applicationDeadline: v})} type="date" />
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Qisqa Tavsif" value={newUni.shortDescription} onChange={v => setNewUni({...newUni, shortDescription: v})} type="textarea" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tarif Rejasi</label>
              <select
                value={newUni.tariffTier}
                onChange={e => setNewUni({...newUni, tariffTier: e.target.value, tariffPrice: e.target.value.includes('B') ? 8000000 : 3000000})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
              >
                <option value="Paket A (Standard)">Paket A (Standard) — 3,000,000 UZS/oy</option>
                <option value="Paket B (Premium)">Paket B (Premium) — 8,000,000 UZS/oy</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-2">
            <button onClick={handleAdd} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Saqlash</span>
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl transition-all">
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* University Cards */}
      <div className="space-y-3">
        {universities.map(uni => {
          const isEditing = editingId === uni.id;
          const isExpanded = expandedId === uni.id;
          const data = isEditing ? editData : uni;

          return (
            <div key={uni.id} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
              
              {/* Card Header */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                    <img src={uni.coverImage} alt={uni.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">{uni.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        uni.tariffTier.includes('B') ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-700 text-slate-300'
                      }`}>{uni.tariffTier}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${uni.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {uni.isActive ? '● Faol' : '● Nofaol'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{uni.region}</span></span>
                      <span>#{uni.ranking?.localRank} reyting</span>
                      <span>{uni.programs?.length} yo'nalish</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : uni.id)}
                    className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                    title={isExpanded ? "Yopish" : "Ko'rish"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {!isEditing ? (
                    <button
                      onClick={() => startEdit(uni)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Tahrirlash</span>
                    </button>
                  ) : (
                    <>
                      <button onClick={saveEdit} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all">
                        <Save className="w-3.5 h-3.5" />
                        <span>Saqlash</span>
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {confirmDelete === uni.id ? (
                    <div className="flex items-center space-x-1">
                      <button onClick={() => { deleteUniversity(uni.id); setConfirmDelete(null); }} className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold">O'chirish</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded-lg bg-slate-700 text-slate-300 text-[11px]">Yo'q</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(uni.id)} className="p-1.5 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="border-t border-slate-800 p-5 space-y-4 bg-slate-950/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="OTM Nomi" value={editData.name || ''} onChange={v => setEditData({...editData, name: v})} />
                    <Field label="To'liq Nomi" value={editData.fullName || ''} onChange={v => setEditData({...editData, fullName: v})} />
                    <Field label="Hudud" value={editData.region || ''} onChange={v => setEditData({...editData, region: v})} />
                    <Field label="Shahar / Manzil" value={editData.city || ''} onChange={v => setEditData({...editData, city: v})} />
                    <Field label="Min Kontrakt (so'm)" value={editData.tuitionFeeMin || 0} onChange={v => setEditData({...editData, tuitionFeeMin: Number(v)})} type="number" />
                    <Field label="Max Kontrakt (so'm)" value={editData.tuitionFeeMax || 0} onChange={v => setEditData({...editData, tuitionFeeMax: Number(v)})} type="number" />
                    <Field label="Grant Imkoniyati" value={editData.grantOpportunity || ''} onChange={v => setEditData({...editData, grantOpportunity: v})} />
                    <Field label="Ariza Muddati" value={editData.applicationDeadline || ''} onChange={v => setEditData({...editData, applicationDeadline: v})} type="date" />
                    <Field label="Reyting Balli" value={editData.ranking?.ratingScore || ''} onChange={v => setEditData({...editData, ranking: {...editData.ranking, ratingScore: v}})} />
                    <Field label="Veb-sayt" value={editData.website || ''} onChange={v => setEditData({...editData, website: v})} placeholder="https://..." />
                    <Field label="Telefon" value={editData.phone || ''} onChange={v => setEditData({...editData, phone: v})} placeholder="+998 xx xxx xx xx" />
                    <Field label="Email" value={editData.email || ''} onChange={v => setEditData({...editData, email: v})} placeholder="info@..." />
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Field label="Muqova Rasm URL" value={editData.coverImage || ''} onChange={v => setEditData({...editData, coverImage: v})} placeholder="https://images.unsplash.com/..." />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Field label="Qisqa Tavsif" value={editData.shortDescription || ''} onChange={v => setEditData({...editData, shortDescription: v})} type="textarea" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tarif Rejasi</label>
                      <select
                        value={editData.tariffTier || ''}
                        onChange={e => setEditData({...editData, tariffTier: e.target.value, tariffPrice: e.target.value.includes('B') ? 8000000 : 3000000})}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                      >
                        <option value="Paket A (Standard)">Paket A (Standard) — 3 mln/oy</option>
                        <option value="Paket B (Premium)">Paket B (Premium) — 8 mln/oy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Holati</label>
                      <select
                        value={editData.isActive ? 'true' : 'false'}
                        onChange={e => setEditData({...editData, isActive: e.target.value === 'true'})}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                      >
                        <option value="true">✅ Faol (Ko'rinadi)</option>
                        <option value="false">❌ Nofaol (Yashirilgan)</option>
                      </select>
                    </div>
                  </div>

                  {/* Programs editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white">Yo'nalishlar</label>
                      <button
                        onClick={() => setEditData({...editData, programs: [...(editData.programs||[]), {id:`p-${Date.now()}`, name:'', degree:'Bakalavr', duration:'4 yil', tuition:10000000}]})}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" /><span>Yo'nalish qo'shish</span>
                      </button>
                    </div>
                    {(editData.programs || []).map((prog, idx) => (
                      <div key={prog.id} className="flex items-center space-x-2">
                        <input
                          value={prog.name}
                          onChange={e => {
                            const updated = [...editData.programs];
                            updated[idx] = {...prog, name: e.target.value};
                            setEditData({...editData, programs: updated});
                          }}
                          placeholder="Yo'nalish nomi"
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          value={prog.tuition}
                          type="number"
                          onChange={e => {
                            const updated = [...editData.programs];
                            updated[idx] = {...prog, tuition: Number(e.target.value)};
                            setEditData({...editData, programs: updated});
                          }}
                          placeholder="Kontrakt"
                          className="w-28 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => setEditData({...editData, programs: editData.programs.filter((_, i) => i !== idx)})}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expanded View (read-only detail) */}
              {isExpanded && !isEditing && (
                <div className="border-t border-slate-800 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs bg-slate-950/30">
                  <div>
                    <span className="text-slate-400 block mb-1">To'liq Nomi</span>
                    <span className="text-white font-medium">{uni.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Kontrakt Diapazoni</span>
                    <span className="text-white font-medium">{(uni.tuitionFeeMin/1000000).toFixed(1)} – {(uni.tuitionFeeMax/1000000).toFixed(1)} mln so'm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Grant</span>
                    <span className="text-white font-medium">{uni.grantOpportunity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Ariza Muddati</span>
                    <span className="text-white font-medium">{uni.applicationDeadline}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Talabalar soni</span>
                    <span className="text-white font-medium">{uni.studentCount?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Tillar</span>
                    <span className="text-white font-medium">{uni.languages?.join(', ')}</span>
                  </div>
                  {uni.website && <div><a href={uni.website} target="_blank" rel="noreferrer" className="text-indigo-400 flex items-center space-x-1"><Globe className="w-3 h-3" /><span>{uni.website}</span></a></div>}
                  {uni.phone && <div className="flex items-center space-x-1 text-slate-300"><Phone className="w-3 h-3" /><span>{uni.phone}</span></div>}
                  {uni.email && <div className="flex items-center space-x-1 text-slate-300"><Mail className="w-3 h-3" /><span>{uni.email}</span></div>}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <span className="text-slate-400 block mb-1">Yo'nalishlar ({uni.programs?.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {uni.programs?.map(p => (
                        <span key={p.id} className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                          {p.name} — {(p.tuition/1000000).toFixed(1)} mln
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
