"use client";

// Kompaniyalar ro'yxati
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function CompaniesPage() {
  const [data, setData] = useState({ data: [], meta: null });
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/companies?q=${encodeURIComponent(q)}`);
        setData(data);
      } catch {
        setData({ data: [], meta: null });
      }
      setLoading(false);
    }, 300); // debounce
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kompaniyalar</h1>
          <p className="mt-1 text-sm text-slate-500">{data.meta?.total ?? "..."} ta kompaniya</p>
        </div>
        <input className="input sm:w-72" placeholder="Kompaniya yoki soha bo'yicha qidirish..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-44 animate-pulse bg-slate-100/60" />)}
        </div>
      ) : data.data.length === 0 ? (
        <div className="card mt-8 p-16 text-center text-slate-400">Kompaniya topilmadi 🏢</div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`} className="card group p-6 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-brand-50 to-violet-50 font-bold text-brand-600">
                  {c.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logoUrl} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    c.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900 group-hover:text-brand-700">{c.name}</h3>
                  <p className="text-sm text-slate-500">{c.sector || "Soha ko'rsatilmagan"}</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-2 min-h-[40px] text-sm leading-relaxed text-slate-500">
                {c.description || "Tavsif kiritilmagan."}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4 text-sm">
                <span className="text-slate-400">📍 {c.location || "—"}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {c._count?.jobs ?? 0} ta vakansiya
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Sahifalash */}
      {data.meta?.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <span key={p} className={`rounded-lg px-3 py-1.5 text-sm ${p === data.meta.page ? "bg-brand-600 text-white" : "text-slate-500"}`}>
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
