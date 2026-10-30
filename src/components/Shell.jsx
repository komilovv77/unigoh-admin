import React, { useEffect, useState } from 'react'
import { LayoutDashboard, FileText, Wallet, Building2, Users, LogOut, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../App'
import { LogoMark } from './ui'
import Dashboard from '../pages/Dashboard'
import Applications from '../pages/Applications'
import Commissions from '../pages/Commissions'
import Universities from '../pages/Universities'
import Staff from '../pages/Staff'

const NAV = [
  { id: 'dashboard', label: 'Bosh panel', icon: LayoutDashboard, master: false, Page: Dashboard },
  { id: 'applications', label: 'Arizalar', icon: FileText, master: false, Page: Applications },
  { id: 'commissions', label: 'Komissiya', icon: Wallet, master: false, Page: Commissions },
  { id: 'universities', label: 'Universitetlar', icon: Building2, master: true, Page: Universities },
  { id: 'staff', label: 'Xodimlar', icon: Users, master: true, Page: Staff },
]

function readHash() {
  const [page, query] = window.location.hash.replace(/^#\/?/, '').split('?')
  return { page: page || 'dashboard', params: new URLSearchParams(query || '') }
}

export function go(page, params) {
  const q = params ? '?' + new URLSearchParams(params).toString() : ''
  window.location.hash = `/${page}${q}`
}

export default function Shell() {
  const { staff, isMaster, uniById } = useAdmin()
  const [route, setRoute] = useState(readHash())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onHash = () => { setRoute(readHash()); setOpen(false) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const items = NAV.filter((n) => isMaster || !n.master)
  const current = items.find((n) => n.id === route.page) || items[0]
  const Page = current.Page
  const uni = staff.university_id ? uniById[staff.university_id] : null

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobil sarlavha */}
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
            <p className="text-xs text-apricot-300 font-medium">{isMaster ? 'Bosh administrator' : uni?.name || 'Universitet'}</p>
          </div>

          <nav className="mt-4 space-y-1 flex-1">
            {items.map((n) => {
              const active = n.id === current.id
              return (
                <a
                  key={n.id}
                  href={`#/${n.id}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    active ? 'bg-apricot-500 text-brand-950' : 'text-brand-100 hover:bg-brand-700'
                  }`}
                >
                  <n.icon className="w-5 h-5" />
                  {n.label}
                </a>
              )
            })}
          </nav>

          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-200 hover:bg-brand-700"
          >
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">
        <Page params={route.params} />
      </main>
    </div>
  )
}
