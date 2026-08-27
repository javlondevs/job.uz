"use client";

// Qidiruv sahifasi - filtrlar, saralash, sahifalash
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search, X } from "lucide-react";
import api from "@/lib/api";
import JobCard from "@/components/JobCard";
import { REGIONS, SECTORS, JOB_TYPE_KEYS, EXPERIENCE_KEYS, regionLabel, sectorLabel } from "@/lib/constants";
import { usePrefs, useT } from "@/lib/store";

export default function JobsPage() {
  const t = useT();
  return (
    <Suspense fallback={<div className="py-32 text-center text-slate-400 dark:text-slate-500">{t("common.loading")}</div>}>
      <JobsContent />
    </Suspense>
  );
}

function JobsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();
  const lang = usePrefs((s) => s.lang);

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
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef(null);

  const loadJobs = useCallback(async (f, p) => {
    setLoading(true);
    const sp = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v && v !== false) sp.set(k, v === true ? "true" : v);
    });
    sp.set("page", p);
    try {
      const { data } = await api.get(`/api/jobs?${sp.toString()}`);
      setData(data);
    } catch {
      setData({ data: [], meta: null });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== false) sp.set(k, v === true ? "true" : v);
    });
    sp.set("page", page);
    router.replace(`/jobs?${sp.toString()}`);
    loadJobs(filters, page);
  }, [filters, page, loadJobs, router]);

  const setF = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const setQ = (value) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setF("q", value), 400);
  };

  const activeFilters = Object.entries(filters).filter(([k, v]) => {
    if (k === "sort") return false;
    if (k === "isRemote") return v === true;
    return v !== "";
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Yuqori qism */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("jobs.title")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {data.meta ? t("jobs.found", { n: data.meta.total }) : t("jobs.searching")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-gold-500 dark:hover:text-gold-400 lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            {t("jobs.filters")}
            {activeFilters.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white dark:bg-gold-500 dark:text-navy-950">
                {activeFilters.length}
              </span>
            )}
          </button>
          <select value={filters.sort} onChange={(e) => setF("sort", e.target.value)} className="input !w-auto">
            <option value="new">🆕 {t("jobs.sortNew")}</option>
            <option value="salary">💰 {t("jobs.sortSalary")}</option>
          </select>
        </div>
      </div>

      {/* Faol filtrlar chiplari */}
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.q && <FilterChip label={`"${filters.q}"`} onRemove={() => { setFilters(f => ({ ...f, q: "" })); }} />}
          {filters.location && <FilterChip label={regionLabel(filters.location, lang)} onRemove={() => setF("location", "")} />}
          {filters.sector && <FilterChip label={sectorLabel(filters.sector, lang)} onRemove={() => setF("sector", "")} />}
          {filters.type && <FilterChip label={t(`list.jobTypes.${filters.type}`)} onRemove={() => setF("type", "")} />}
          {filters.experience && <FilterChip label={t(`list.exp.${filters.experience}`)} onRemove={() => setF("experience", "")} />}
          {filters.isRemote && <FilterChip label={t("jobs.remoteWork")} onRemove={() => setF("isRemote", false)} />}
          <button
            onClick={() => setFilters({ q: "", location: "", sector: "", type: "", experience: "", salaryMin: "", salaryMax: "", isRemote: false, sort: filters.sort })}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-400"
          >
            {t("common.clear")}
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ===== FILTRLAR PANELI ===== */}
        <aside className={`${showFilters ? "block" : "hidden"} space-y-5 lg:block`}>
          <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{t("jobs.filters")}</h3>
              <button
                onClick={() =>
                  setFilters({ q: "", location: "", sector: "", type: "", experience: "", salaryMin: "", salaryMax: "", isRemote: false, sort: filters.sort })
                }
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 dark:text-gold-400 dark:hover:text-gold-300"
              >
                {t("common.clear")}
              </button>
            </div>

            {/* Kalit so'z */}
            <Field label={t("jobs.keyword")}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input !pl-9"
                  placeholder={t("jobs.keywordPh")}
                  defaultValue={filters.q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </Field>

            {/* Viloyat */}
            <Field label={t("jobs.region")}>
              <select className="input" value={filters.location} onChange={(e) => setF("location", e.target.value)}>
                <option value="">{t("common.all")}</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{regionLabel(r, lang)}</option>
                ))}
              </select>
            </Field>

            {/* Soha */}
            <Field label={t("jobs.sector")}>
              <select className="input" value={filters.sector} onChange={(e) => setF("sector", e.target.value)}>
                <option value="">{t("common.all")}</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{sectorLabel(s, lang)}</option>
                ))}
              </select>
            </Field>

            {/* Ish turi */}
            <Field label={t("jobs.jobType")}>
              <div className="grid grid-cols-2 gap-1.5">
                {JOB_TYPE_KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => setF("type", filters.type === k ? "" : k)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                      filters.type === k
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-gold-500 dark:bg-gold-500/15 dark:text-gold-300"
                        : "border-slate-200 text-slate-600 hover:border-brand-200 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    {t(`list.jobTypes.${k}`)}
                  </button>
                ))}
              </div>
            </Field>

            {/* Tajriba */}
            <Field label={t("jobs.expLevel")}>
              <select className="input" value={filters.experience} onChange={(e) => setF("experience", e.target.value)}>
                <option value="">{t("jobs.anyExp")}</option>
                {EXPERIENCE_KEYS.map((k) => (
                  <option key={k} value={k}>{t(`list.exp.${k}`)}</option>
                ))}
              </select>
            </Field>

            {/* Maosh oralig'i */}
            <Field label={`${t("jobs.salary")}: ${Number(filters.salaryMin || 0).toLocaleString("ru-RU")} - ${Number(filters.salaryMax || 30000000).toLocaleString("ru-RU")}`}>
              <input
                type="range"
                min="0"
                max="30000000"
                step="1000000"
                value={filters.salaryMax || 30000000}
                onChange={(e) => setF("salaryMax", e.target.value == 30000000 ? "" : e.target.value)}
                className="w-full accent-brand-600 dark:accent-gold-500"
              />
              <div className="mt-2 flex gap-2">
                <input type="number" className="input !py-1.5 !text-xs" placeholder={t("common.from")} value={filters.salaryMin} onChange={(e) => setF("salaryMin", e.target.value)} />
                <input type="number" className="input !py-1.5 !text-xs" placeholder={t("common.to")} value={filters.salaryMax} onChange={(e) => setF("salaryMax", e.target.value)} />
              </div>
            </Field>

            {/* Masofaviy toggle */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-violet-50 px-4 py-3 dark:bg-violet-500/10">
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">🏠 {t("jobs.remoteWork")}</span>
              <button
                role="switch"
                aria-checked={filters.isRemote}
                onClick={() => setF("isRemote", !filters.isRemote)}
                className={`relative h-6 w-11 rounded-full transition ${filters.isRemote ? "bg-brand-600 dark:bg-gold-500" : "bg-slate-300 dark:bg-slate-600"}`}
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
                <div key={i} className="card h-32 animate-pulse bg-slate-100/60 dark:bg-slate-800/60" />
              ))}
            </div>
          ) : data.data.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 p-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Search size={32} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("jobs.none")}</h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  {t("jobs.noneText")}
                </p>
              </div>
              <button
                onClick={() => {
                  setFilters({ q: "", location: "", sector: "", type: "", experience: "", salaryMin: "", salaryMax: "", isRemote: false, sort: "new" });
                  setPage(1);
                }}
                className="btn-outline !px-6"
              >
                {t("common.clear")}
              </button>
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

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:bg-gold-500/15 dark:text-gold-300">
      {label}
      <button onClick={onRemove} className="rounded-full p-0.5 transition hover:bg-brand-200 dark:hover:bg-gold-500/30">
        <X size={12} />
      </button>
    </span>
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
            p === page ? "bg-brand-600 text-white shadow dark:bg-gold-500 dark:text-navy-950" : "border border-slate-200 text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
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
    <button {...props} className="h-9 w-9 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:border-brand-300 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500">
      {children}
    </button>
  );
}
