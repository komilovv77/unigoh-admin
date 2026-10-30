import React, { useEffect, useState } from 'react'
import { LayoutDashboard, FileText, Wallet, Building2, UserCog, LogOut, Menu, X, Search, GraduationCap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { LogoMark } from './ui'
import Dashboard from '../pages/Dashboard'
import Applications from '../pages/Applications'
import Finance from '../pages/Finance'
import Universities from '../pages/Universities'
import UniversityDetail from '../pages/UniversityDetail'
import Students from '../pages/Students'
import StudentDetail from '../pages/StudentDetail'
import Staff from '../pages/Staff'

// who: 'all' | 'master' | 'uni'
const NAV = [
  { id: 'dashboard', label: 'Bosh panel', icon: LayoutDashboard, who: 'all', Page: Dashboard },
  { id: 'universities', label: 'Universitetlar', icon: Building2, who: 'master', Page: Universities },
  { id: 'university', label: 'Universitetim', icon: Building2, who: 'uni', Page: UniversityDetail },
  { id: 'students', label: 'Talabalar', icon: GraduationCap, who: 'all', Page: Students },
  { id: 'applications', label: 'Arizalar', icon: FileText, who: 'all', Page: Applications },
  { id: 'finance', label: 'Moliya', icon: Wallet, who: 'master', Page: Finance },
  { id: 'staff', label: 'Xodimlar', icon: UserCog, who: 'master', Page: Staff },
]
// Menyuda ko'rinmaydigan ichki sahifalar
const HIDDEN = [
  { id: 'university', who: 'master', Page: UniversityDetail, parent: 'universities' },
  { id: 'student', who: 'all', Page: StudentDetail, parent: 'students' },
]

function readHash() {
  const [page, query] = window.location.hash.replace(/^#\/?/, '').split('?')
  return { page: page || 'dashboard', params: new URLSearchParams(query || '') }
}

export function go(page, params) {
  const q = params ? '?' + new URLSearchParams(params).toString() : ''
  window.location.hash = `/${page}${q}`
  window.scrollTo(0, 0)
}

export default function Shell() {
  const { staff, isMaster, uniById } = useAdmin()
  const [route, setRoute] = useState(readHash())
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const onHash = () => { setRoute(readHash()); setOpen(false) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const allowed = (n) => n.who === 'all' || (n.who === 'master' ? isMaster : !isMaster)
  const items = NAV.filter(allowed)
  const hidden = HIDDEN.filter(allowed)
  const current = items.find((n) => n.id === route.page) || hidden.find((n) => n.id === route.page) || items[0]
  const activeNav = current.parent || current.id
  const Page = current.Page
  const uni = staff.university_id ? uniById[staff.university_id] : null

  function submitSearch(e) {
    e.preventDefault()
    if (search.trim()) go('students', { q: search.trim() })
  }

  return (
    <div className="min-h-screen lg:flex">
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-brand-800 text-white">
        <div className="flex items-center gap-2">
          <LogoMark className="w-8 h-8" />
          <span className="font-extrabold">uni<span className="text-apricot-400">goh</span> admin</span>
        </div>
        <button onClick={() => setOpen(!open)} aria-label="Menyu" className="p-2">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <aside className={`${open ? 'block' : 'hidden'} lg:block fixed lg:sticky top-14 lg:top-0 inset-x-0 lg:inset-auto z-20 lg:h-screen lg:w-64 shrink-0 bg-brand-800 text-white`}>
        <div className="flex flex-col h-full p-4">
          <div className="hidden lg:flex items-center gap-2.5 px-2 py-3">
            <LogoMark className="w-9 h-9" />
            <span className="text-xl font-extrabold">uni<span className="text-apricot-400">goh</span></span>
          </div>

          <div className="mt-2 lg:mt-4 px-3 py-3 rounded-xl bg-brand-900/60">
            <p className="text-sm font-semibold truncate">{staff.full_name || 'Xodim'}</p>
            <p className="text-xs text-apricot-300 font-medium truncate">{isMaster ? 'Bosh administrator' : uni?.name || 'Universitet'}</p>
          </div>

          <form onSubmit={submitSearch} className="mt-4 relative">
            <Search className="w-4 h-4 text-brand-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Talaba qidirish..."
              aria-label="Talaba qidirish"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-brand-900/60 border border-brand-700 text-sm text-white placeholder-brand-300 outline-none focus:border-apricot-400"
            />
          </form>

          <nav className="mt-4 space-y-1 flex-1">
            {items.map((n) => (
              <a key={n.id} href={`#/${n.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  n.id === activeNav ? 'bg-apricot-500 text-brand-950' : 'text-brand-100 hover:bg-brand-700'
                }`}>
                <n.icon className="w-5 h-5" />
                {n.label}
              </a>
            ))}
          </nav>

          <button onClick={() => supabase.auth.signOut()}
            className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-200 hover:bg-brand-700">
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">
        <Page key={route.page + route.params.toString()} params={route.params} />
      </main>
    </div>
  )
}
