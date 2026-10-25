import React, { useState, useEffect, createContext, useContext } from 'react';
import { INITIAL_UNIVERSITIES } from './data/universities';
import { ADMIN_ACCOUNTS } from './data/admins';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import UniversityManager from './components/UniversityManager';
import ApplicationsManager from './components/ApplicationsManager';
import UsersManager from './components/UsersManager';
import SettingsPanel from './components/SettingsPanel';
import { 
  LayoutDashboard, Building2, FileText, Users, Settings, LogOut, 
  GraduationCap, Bell, ChevronRight, Menu, X, ShieldAlert
} from 'lucide-react';

// ─── Global Admin Context ────────────────────────────────────────────────────
export const AdminContext = createContext();
export const useAdmin = () => useContext(AdminContext);

function AdminApp() {
  const { currentAdmin, logout, notifications } = useAdmin();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(3);

  const isMaster = currentAdmin?.role === 'master';

  const navItems = [
    { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard, color: 'text-indigo-400', allowed: ['master', 'university_admin'] },
    { id: 'universities', label: "OTMlar Boshqaruvi", icon: Building2, color: 'text-blue-400', allowed: ['master'] },
    { id: 'applications', label: 'Arizalar & CRM', icon: FileText, color: 'text-emerald-400', allowed: ['master', 'university_admin'] },
    { id: 'users', label: 'Admin Foydalanuvchilar', icon: Users, color: 'text-amber-400', allowed: ['master'] },
    { id: 'settings', label: 'Sozlamalar', icon: Settings, color: 'text-slate-400', allowed: ['master', 'university_admin'] },
  ].filter(item => item.allowed.includes(currentAdmin?.role));

  return (
    <div className="min-h-screen bg-slate-950 flex">
      
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} md:w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 fixed md:relative h-full z-30`}>
        
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center text-white font-black text-sm">U</div>
          <div>
            <div className="font-black text-white text-sm tracking-tight">UniGoh Admin</div>
            <div className="text-[10px] text-slate-400 font-mono">unigohadmin.uz</div>
          </div>
        </div>

        {/* Current Admin Card */}
        <div className="mx-4 mt-4 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentAdmin?.color} flex items-center justify-center text-white font-bold text-xs`}>
              {currentAdmin?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentAdmin?.name}</div>
              <div className={`text-[10px] font-semibold ${isMaster ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isMaster ? '👑 Master Admin' : '🏫 OTM Admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Chiqish (Sign Out)</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-400"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">
                {navItems.find(n => n.id === activePage)?.label || 'Admin Panel'}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                UniGoh boshqaruv markazi — unigohadmin.uz
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isMaster && (
              <a
                href="https://unigoh.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Asosiy Saytga O'tish</span>
              </a>
            )}
            <button className="relative p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors" onClick={() => setUnreadNotifs(0)}>
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'universities' && <UniversityManager />}
          {activePage === 'applications' && <ApplicationsManager />}
          {activePage === 'users' && <UsersManager />}
          {activePage === 'settings' && <SettingsPanel />}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

// ─── Root with Context & Auth ─────────────────────────────────────────────────
export default function App() {
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('unigoh_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [universities, setUniversities] = useState(() => {
    try {
      const saved = localStorage.getItem('unigoh_universities');
      return saved ? JSON.parse(saved) : INITIAL_UNIVERSITIES;
    } catch { return INITIAL_UNIVERSITIES; }
  });

  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('unigoh_applications');
      return saved ? JSON.parse(saved) : generateDemoApplications();
    } catch { return generateDemoApplications(); }
  });

  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('unigoh_universities', JSON.stringify(universities));
  }, [universities]);

  useEffect(() => {
    localStorage.setItem('unigoh_applications', JSON.stringify(applications));
  }, [applications]);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const login = (username, password) => {
    const account = ADMIN_ACCOUNTS.find(
      a => a.username === username && a.password === password
    );
    if (account) {
      const session = { ...account, password: undefined, lastLogin: new Date().toISOString() };
      setCurrentAdmin(session);
      localStorage.setItem('unigoh_admin_session', JSON.stringify(session));
      notify(`Xush kelibsiz, ${account.name}!`);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('unigoh_admin_session');
  };

  const updateUniversity = (id, updates) => {
    setUniversities(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    notify('OTM ma\'lumotlari muvaffaqiyatli yangilandi! ✓');
  };

  const addUniversity = (uni) => {
    setUniversities(prev => [...prev, { ...uni, id: `uni-${Date.now()}` }]);
    notify('Yangi OTM qo\'shildi! ✓');
  };

  const deleteUniversity = (id) => {
    setUniversities(prev => prev.filter(u => u.id !== id));
    notify('OTM o\'chirildi.', 'warning');
  };

  const updateApplicationStatus = (appId, newStatus) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    notify(`Ariza holati yangilandi: ${newStatus}`);
  };

  const contextValue = {
    currentAdmin, universities, applications, notifications,
    login, logout, notify, updateUniversity, addUniversity, deleteUniversity, updateApplicationStatus
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center space-x-2 border ${
          toast.type === 'success'
            ? 'bg-emerald-900/90 text-emerald-300 border-emerald-700/50'
            : 'bg-amber-900/90 text-amber-300 border-amber-700/50'
        } backdrop-blur`}>
          <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {!currentAdmin ? <LoginPage /> : <AdminApp />}
    </AdminContext.Provider>
  );
}

function generateDemoApplications() {
  const students = [
    { name: "Aziz Karimov", phone: "+998 90 111 22 33", pinfl: "31405019870012" },
    { name: "Nodira Yusupova", phone: "+998 93 222 33 44", pinfl: "60305020050034" },
    { name: "Jahongir Toshmatov", phone: "+998 91 333 44 55", pinfl: "31005021430056" },
    { name: "Malika Hasanova", phone: "+998 94 444 55 66", pinfl: "60105022080078" },
    { name: "Bobur Raximov", phone: "+998 99 555 66 77", pinfl: "31505023560090" },
    { name: "Zulfiya Olimova", phone: "+998 97 666 77 88", pinfl: "60605024010001" },
    { name: "Sardor Nazarov", phone: "+998 90 777 88 99", pinfl: "31305019910023" },
  ];
  const unis = ["isft-andijan", "aipi-andijan", "kokand-uni", "nordic-uni", "emu-university", "team-university"];
  const uniNames = { "isft-andijan": "ISFT", "aipi-andijan": "AIPI", "kokand-uni": "Qo'qon Universiteti", "nordic-uni": "Nordic University", "emu-university": "EMU", "team-university": "TEAM University" };
  const programs = ["Dasturiy injiniring", "Ingliz tili", "Moliya va Bank ishi", "Tibbiyot", "Biznes menejment", "Turizm"];
  const statuses = ["PENDING", "IN_REVIEW", "EXAM_SCHEDULED", "APPROVED", "CONTRACT_ISSUED", "REJECTED"];

  return students.map((s, i) => {
    const uniId = unis[i % unis.length];
    return {
      id: `UNIGOH-2026-${uniId.split('-')[0].toUpperCase()}-${String(1000 + i).padStart(4, '0')}`,
      applicantName: s.name,
      applicantPhone: s.phone,
      applicantPinfl: s.pinfl,
      universityId: uniId,
      universityName: uniNames[uniId],
      programName: programs[i % programs.length],
      status: statuses[i % statuses.length],
      submittedAt: new Date(Date.now() - (i * 86400000 * 3)).toLocaleDateString('uz-UZ'),
      notes: ""
    };
  });
}
