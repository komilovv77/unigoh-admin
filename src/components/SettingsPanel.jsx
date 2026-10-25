import React, { useState } from 'react';
import { useAdmin } from '../App';
import { Settings, Globe, RefreshCw, Save, Info, Link } from 'lucide-react';

export default function SettingsPanel() {
  const { currentAdmin, notify, universities } = useAdmin();
  const isMaster = currentAdmin?.role === 'master';

  const [siteSettings, setSiteSettings] = useState({
    mainUrl: 'https://unigoh.vercel.app',
    adminUrl: 'https://unigohadmin.vercel.app',
    siteName: 'UniGoh',
    slogan: "UniGoh — Barcha universitetlar bir joyda",
    supportPhone: '+998 90 000 00 00',
    supportEmail: 'support@unigoh.uz',
    telegramBot: '@unigoh_bot',
  });

  const handleSave = () => {
    localStorage.setItem('unigoh_site_settings', JSON.stringify(siteSettings));
    notify('Sozlamalar saqlandi!');
  };

  const handleResetData = () => {
    if (window.confirm('Barcha ma\'lumotlarni o\'chirish va boshlang\'ich holatga qaytarishni xohlaysizmi?')) {
      localStorage.removeItem('unigoh_applications');
      localStorage.removeItem('unigoh_universities');
      notify('Ma\'lumotlar tozalandi. Sahifani yangilang.', 'warning');
    }
  };

  const Field = ({ label, value, onChange, placeholder }) => (
    <div>
      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={!isMaster}
        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-black text-white">Sozlamalar</h2>
        <p className="text-slate-400 text-xs mt-0.5">Platform sozlamalari va texnik ma'lumotlar</p>
      </div>

      {/* Site Info */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>Sayt Ma'lumotlari</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Asosiy Sayt URL" value={siteSettings.mainUrl} onChange={v => setSiteSettings({...siteSettings, mainUrl: v})} placeholder="https://unigoh.uz" />
          <Field label="Admin Panel URL" value={siteSettings.adminUrl} onChange={v => setSiteSettings({...siteSettings, adminUrl: v})} placeholder="https://unigohadmin.uz" />
          <Field label="Platforma Nomi" value={siteSettings.siteName} onChange={v => setSiteSettings({...siteSettings, siteName: v})} />
          <Field label="Slogon" value={siteSettings.slogan} onChange={v => setSiteSettings({...siteSettings, slogan: v})} />
          <Field label="Qo'llab-quvvatlash Telefon" value={siteSettings.supportPhone} onChange={v => setSiteSettings({...siteSettings, supportPhone: v})} />
          <Field label="Qo'llab-quvvatlash Email" value={siteSettings.supportEmail} onChange={v => setSiteSettings({...siteSettings, supportEmail: v})} />
          <Field label="Telegram Bot" value={siteSettings.telegramBot} onChange={v => setSiteSettings({...siteSettings, telegramBot: v})} />
        </div>
        {isMaster && (
          <button onClick={handleSave} className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all">
            <Save className="w-4 h-4" />
            <span>Saqlash</span>
          </button>
        )}
      </div>

      {/* Domain Instructions */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Link className="w-4 h-4 text-emerald-400" />
          <span>Domen Ulash Ko'rsatmasi (.uz)</span>
        </h3>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-800 rounded-2xl p-4 space-y-2 border border-slate-700">
            <p className="font-bold text-white">1. unigoh.uz domenini ro'yxatdan o'tkazish:</p>
            <p>🌐 <a href="https://nic.uz" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">nic.uz</a> ga kiring va "unigoh.uz" ni buyurtma qiling (~\$10-15/yil)</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4 space-y-2 border border-slate-700">
            <p className="font-bold text-white">2. Vercel da custom domain ulash:</p>
            <p className="text-slate-400">Vercel Dashboard → Settings → Domains → "unigoh.uz" qo'shing</p>
            <p className="text-slate-400">DNS record: <code className="bg-slate-700 px-1 rounded text-emerald-400">CNAME @ cname.vercel-dns.com</code></p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4 space-y-2 border border-slate-700">
            <p className="font-bold text-white">3. Admin panel uchun:</p>
            <p className="text-slate-400">Shu tartibda "unigohadmin.uz" ni ham ro'yxatdan o'tkazing va Vercel ga ulang</p>
          </div>
        </div>
      </div>

      {/* Tech Info */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Texnik Ma'lumotlar</span>
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Frontend', value: 'React 18 + Vite 6' },
            { label: 'Styling', value: 'Tailwind CSS v4' },
            { label: 'Hosting', value: 'Vercel (Global CDN)' },
            { label: 'Auth', value: 'JWT + localStorage' },
            { label: 'Encryption', value: 'AES-256 (docs)' },
            { label: 'OTMlar', value: `${universities.length} ta` },
          ].map(item => (
            <div key={item.label} className="bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{item.label}</div>
              <div className="text-white font-bold mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      {isMaster && (
        <div className="bg-rose-500/5 rounded-3xl border border-rose-500/20 p-6 space-y-3">
          <h3 className="text-sm font-bold text-rose-400">⚠ Xavfli Zona</h3>
          <p className="text-xs text-slate-400">Demo ma'lumotlarini tozalash va boshlang'ich holatga qaytarish</p>
          <button onClick={handleResetData} className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Barcha Ma'lumotlarni Tozalash</span>
          </button>
        </div>
      )}
    </div>
  );
}
