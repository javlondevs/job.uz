"use client";

// Kompaniyalar ro'yxati
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { usePrefs, useT } from "@/lib/store";
import { sectorLabel, regionLabel } from "@/lib/constants";

export default function CompaniesPage() {
  const [data, setData] = useState({ data: [], meta: null });
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/companies?q=${encodeURIComponent(q)}`);
        setData(data);
      } catch {
        setData({ data: [], meta: null });
      }
      setLoading(false);
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("companies.title")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {data.meta ? t("companies.count", { n: data.meta.total }) : "..."}
          </p>
        </div>
        <input className="input sm:w-72" placeholder={t("companies.searchPh")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-44 animate-pulse bg-slate-100/60 dark:bg-slate-800/60" />)}
        </div>
      ) : data.data.length === 0 ? (
        <div className="card mt-8 p-16 text-center text-slate-400">{t("companies.notFound")}</div>
      ) : (
        <CompanyGrid data={data} />
      )}

      {/* Sahifalash */}
      {data.meta?.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <span key={p} className={`rounded-lg px-3 py-1.5 text-sm ${p === data.meta.page ? "bg-brand-600 text-white dark:bg-gold-500 dark:text-navy-950" : "text-slate-500"}`}>
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyGrid({ data }) {
  const lang = usePrefs((s) => s.lang);
  const t = useT();

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.data.map((c) => (
        <Link key={c.id} href={`/companies/${c.id}`} className="card group p-6 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft dark:hover:border-gold-500/40">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-brand-50 to-violet-50 font-bold text-brand-600 dark:border-slate-800 dark:from-brand-500/15 dark:to-violet-500/15 dark:text-brand-300">
              {c.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logoUrl} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                c.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-bold text-slate-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-gold-400">{c.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{sectorLabel(c.sector, lang) || t("companies.noSector")}</p>
            </div>
          </div>
          <p className="mt-4 line-clamp-2 min-h-[40px] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {c.description || t("companies.noDesc")}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4 text-sm dark:border-slate-800">
            <span className="text-slate-400">📍 {regionLabel(c.location, lang) || c.location || "—"}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              {t("companies.vacancies", { n: c._count?.jobs ?? 0 })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
