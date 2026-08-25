"use client";

// Navbar - JOBUZ navigatsiya (qalqon logotip + til + tema + CTA tugmalar)
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Menu, X, Sun, Moon, Globe } from "lucide-react";
import { useAuth, usePrefs, useT } from "@/lib/store";
import { LANGS } from "@/lib/i18n";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, theme, toggleTheme, mounted } = usePrefs();
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  function handleLogout() {
    logout();
    setOpen(false);
    // replace - "orqaga" bosganda dashboard'ga qaytib kelmasin
    router.replace("/");
  }


  // Til menyusini tashqariga bosganda yopish
  useEffect(() => {
    const onClick = (e) => {
      if (!langRef.current?.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logotip: aylana ichida qalqon + JOBUZ */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-950 text-gold-500 shadow-md ring-2 ring-gold-500/60 transition group-hover:ring-gold-400 dark:bg-gold-500 dark:text-navy-950">
            <Shield size={22} strokeWidth={2.2} fill="currentColor" fillOpacity={0.25} />
          </span>
          <span className="font-display text-xl font-extrabold tracking-wide text-navy-950 dark:text-white">
            JOB<span className="text-gold-600 dark:text-gold-400">UZ</span>
          </span>
        </Link>

        {/* Desktop tugmalar */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Til almashtirgich */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy-950 transition hover:border-navy-950/40 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
              aria-label={t("nav.language")}
            >
              <Globe size={16} />
              <span suppressHydrationWarning>{mounted ? current.flag : "🌐"}</span>
              <span className="hidden lg:inline">{mounted ? current.code.toUpperCase() : ""}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      l.code === lang ? "font-bold text-brand-600 dark:text-gold-400" : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="text-base">{l.flag}</span> {l.label}
                    {l.code === lang && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kunduzgi / tungi rejim */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 p-2.5 text-navy-950 transition hover:border-navy-950/40 dark:border-slate-700 dark:text-gold-400 dark:hover:border-gold-500/60"
            aria-label={theme === "dark" ? "Kunduzgi rejim" : "Tungi rejim"}
            suppressHydrationWarning
          >
            {mounted ? theme === "dark" ? <Sun size={18} /> : <Moon size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                {user.name.split(" ")[0]} — {t("nav.dashboard")}
              </Link>
              <button
                onClick={handleLogout}
                className="px-2 py-2 text-sm font-medium text-slate-400 transition hover:text-rose-500"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              {/* Oq/kontur tugma */}
              <Link
                href="/login?tab=register&role=employer"
                className="inline-flex items-center justify-center rounded-xl border border-navy-950/20 bg-white px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:border-navy-950 hover:bg-navy-950/[0.03] active:scale-[0.98] dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:border-slate-400"
              >
                {t("nav.postJob")}
              </Link>
              {/* To'q ko'k tugma */}
              <Link
                href="/cv-builder"
                className="btn-navy inline-flex items-center justify-center !rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                {t("nav.sendCv")}
              </Link>
            </>
          )}
        </div>

        {/* Mobil: til + tema + burger */}
        <div className="flex items-center gap-1.5 md:hidden">
          <select
            value={mounted ? lang : "uz"}
            onChange={(e) => setLang(e.target.value)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-transparent px-1.5 py-2 text-xs font-semibold text-navy-950 outline-none dark:border-slate-700 dark:text-slate-200"
            aria-label={t("nav.language")}
            suppressHydrationWarning
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-navy-950 transition hover:bg-slate-100 dark:text-gold-400 dark:hover:bg-slate-800"
            aria-label="Rejimni almashtirish"
            suppressHydrationWarning
          >
            {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-navy-950 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-label="Menyu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobil menyu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
          {user ? (
            <>
              <MobileLink href="/dashboard" onClick={() => setOpen(false)}>{t("nav.dashboard")}</MobileLink>
              <button
                onClick={() => { handleLogout(); setOpen(false); }}
                className="mt-1 w-full rounded-xl px-3 py-2.5 text-left font-medium text-rose-500"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <MobileLink href="/login?tab=register&role=employer" onClick={() => setOpen(false)}>
                {t("nav.postJob")}
              </MobileLink>
              <Link
                href="/cv-builder"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-xl bg-navy-950 px-4 py-3 text-center font-semibold text-white transition hover:bg-navy-800 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400"
              >
                {t("nav.sendCv")}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function MobileLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl border border-navy-950/15 px-4 py-3 text-center font-semibold text-navy-950 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {children}
    </Link>
  );
}
