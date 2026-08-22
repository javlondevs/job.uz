"use client";

// Qidiruv sahifasi - filtrlar, saralash, sahifalash
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import JobCard from "@/components/JobCard";
import { REGIONS, SECTORS, JOB_TYPES, EXPERIENCE_LEVELS } from "@/lib/constants";

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-slate-400">Yuklanmoqda...</div>}>
      <JobsContent />
    </Suspense>
  );
}

function JobsContent() {
  const router = useRouter();
  const params = useSearchParams();

  // Filtr holati URL'dan olinadi (link bilan bo'lishish mumkin)
  const [filters, setFilters] = useState({
    q: params.get("q") || "",
    location: params.get("location") || "",
    sector: params.get("sector") || "",
    type: params.get("type") || "",
    experience: params.get("experience") || "",
    salaryMin: params.get("salaryMin") || "",
    salaryMax: params.get("salaryMax") || "",
    isRemote: params.get("isRemote") === "true",
    sort: params.get("sort") || "new",
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], meta: null });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false); // mobil uchun

  // Filtrlar o'zgarganda URL'ni yangilash + yuklash
  useEffect(() => {
    const sp = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== false) sp.set(k, v === true ? "true" : v);
    });
    sp.set("page", page);
    router.replace(`/jobs?${sp.toString()}`);

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/jobs?${sp.toString()}`);
        setData(data);
      } catch {
        setData({ data: [], meta: null });
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const setF = (key, value) => {
    setPage(1); // filtr o'zgarsa birinchi sahifaga
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Yuqori qism */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vakansiyalar</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.meta ? `${data.meta.total} ta natija topildi` : "Qidirilyapti..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline lg:hidden" onClick={() => setShowFilters(!showFilters)}>
            ⚙️ Filtrlar
          </button>
          <select value={filters.sort} onChange={(e) => setF("sort", e.target.value)} className="input !w-auto">
            <option value="new">🆕 Eng yangi</option>
            <option value="salary">💰 Maosh bo'yicha</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ===== FILTRLAR PANELI ===== */}
        <aside className={`${showFilters ? "block" : "hidden"} space-y-5 lg:block`}>
          <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Filtrlar</h3>
              <button
                onClick={() =>
                  setFilters({ q: "", location: "", sector: "", type: "", experience: "", salaryMin: "", salaryMax: "", isRemote: false, sort: filters.sort })
                }
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                Tozalash
              </button>
            </div>

            {/* Kalit so'z */}
            <Field label="Kalit so'z">
              <input className="input" placeholder="Masalan: dasturchi" value={filters.q} onChange={(e) => setF("q", e.target.value)} />
            </Field>

            {/* Viloyat */}
            <Field label="Viloyat / shahar">
              <select className="input" value={filters.location} onChange={(e) => setF("location", e.target.value)}>
                <option value="">Barchasi</option>
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>

            {/* Soha */}
            <Field label="Soha">
              <select className="input" value={filters.sector} onChange={(e) => setF("sector", e.target.value)}>
                <option value="">Barchasi</option>
                {SECTORS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            {/* Ish turi */}
            <Field label="Ish turi">
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(JOB_TYPES).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setF("type", filters.type === k ? "" : k)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                      filters.type === k
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600 hover:border-brand-200"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </Field>

            {/* Tajriba */}
            <Field label="Tajriba darajasi">
              <select className="input" value={filters.experience} onChange={(e) => setF("experience", e.target.value)}>
                <option value="">Farqi yo'q</option>
                {Object.entries(EXPERIENCE_LEVELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>

            {/* Maosh oralig'i */}
            <Field label={`Maosh: ${Number(filters.salaryMin || 0).toLocaleString("ru-RU")} - ${Number(filters.salaryMax || 30000000).toLocaleString("ru-RU")} so'm`}>
              <input
                type="range"
                min="0"
                max="30000000"
                step="1000000"
                value={filters.salaryMax || 30000000}
                onChange={(e) => setF("salaryMax", e.target.value == 30000000 ? "" : e.target.value)}
                className="w-full accent-brand-600"
              />
              <div className="mt-2 flex gap-2">
                <input type="number" className="input !py-1.5 !text-xs" placeholder="dan" value={filters.salaryMin} onChange={(e) => setF("salaryMin", e.target.value)} />
                <input type="number" className="input !py-1.5 !text-xs" placeholder="gacha" value={filters.salaryMax} onChange={(e) => setF("salaryMax", e.target.value)} />
              </div>
            </Field>

            {/* Masofaviy toggle */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-violet-50 px-4 py-3">
              <span className="text-sm font-semibold text-violet-700">🏠 Masofaviy ish</span>
              <button
                role="switch"
                aria-checked={filters.isRemote}
                onClick={() => setF("isRemote", !filters.isRemote)}
                className={`relative h-6 w-11 rounded-full transition ${filters.isRemote ? "bg-brand-600" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    filters.isRemote ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        </aside>

        {/* ===== NATIJALAR ===== */}
        <div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card h-32 animate-pulse bg-slate-100/60" />
              ))}
            </div>
          ) : data.data.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-16 text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="font-bold text-slate-900">Hech narsa topilmadi</h3>
              <p className="max-w-sm text-sm text-slate-500">
                Filtrlarni yumshatib ko'ring yoki boshqa kalit so'z bilan qidirib ko'ring.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data.data.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Sahifalash */}
              {data.meta?.totalPages > 1 && (
                <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5">
      <PageBtn disabled={page === 1} onClick={() => onChange(page - 1)}>←</PageBtn>
      {pages[0] > 1 && <span className="px-1 text-slate-400">...</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`h-9 w-9 rounded-xl text-sm font-semibold transition ${
            p === page ? "bg-brand-600 text-white shadow" : "border border-slate-200 text-slate-600 hover:border-brand-300"
          }`}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && <span className="px-1 text-slate-400">...</span>}
      <PageBtn disabled={page === totalPages} onClick={() => onChange(page + 1)}>→</PageBtn>
    </nav>
  );
}

function PageBtn({ children, ...props }) {
  return (
    <button {...props} className="h-9 w-9 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:border-brand-300 disabled:opacity-40">
      {children}
    </button>
  );
}
