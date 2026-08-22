"use client";

// Navbar - asosiy navigatsiya
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/store";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="8" width="18" height="12" rx="2" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Job<span className="text-brand-600">Uz</span>
          </span>
        </Link>

        {/* Desktop menyu */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/jobs">Vakansiyalar</NavLink>
          <NavLink href="/companies">Kompaniyalar</NavLink>
          {user?.role === "JOB_SEEKER" && <NavLink href="/cv-builder">CV Builder</NavLink>}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                {user.name.split(" ")[0]} — Dashboard
              </Link>
              <button onClick={logout} className="px-2 py-2 text-sm font-medium text-slate-400 transition hover:text-rose-500">
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline !py-2">Kirish</Link>
              <Link href="/login?tab=register" className="btn-primary !py-2">Ro'yxatdan o'tish</Link>
            </>
          )}
        </div>

        {/* Mobil burger */}
        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-slate-100 md:hidden" aria-label="Menyu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {/* Mobil menyu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <MobileLink href="/jobs" onClick={() => setOpen(false)}>Vakansiyalar</MobileLink>
          <MobileLink href="/companies" onClick={() => setOpen(false)}>Kompaniyalar</MobileLink>
          {user?.role === "JOB_SEEKER" && (
            <MobileLink href="/cv-builder" onClick={() => setOpen(false)}>CV Builder</MobileLink>
          )}
          {user ? (
            <>
              <MobileLink href="/dashboard" onClick={() => setOpen(false)}>Dashboard</MobileLink>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full rounded-lg px-3 py-2 text-left font-medium text-rose-500"
              >
                Chiqish
              </button>
            </>
          ) : (
            <>
              <MobileLink href="/login" onClick={() => setOpen(false)}>Kirish</MobileLink>
              <MobileLink href="/login?tab=register" onClick={() => setOpen(false)}>Ro'yxatdan o'tish</MobileLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }) {
  return (
    <Link href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-brand-700">
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }) {
  return (
    <Link href={href} onClick={onClick} className="block rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
      {children}
    </Link>
  );
}
