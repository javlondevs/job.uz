"use client";

// JobCard - vakansiya kartasi (qidiruv va bosh sahifada ishlatiladi)
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { salaryText, timeAgo } from "@/lib/constants";
import { usePrefs, useT } from "@/lib/store";

export default function JobCard({ job }) {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const c = job.company || {};

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="card group flex flex-col gap-3 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft dark:hover:border-gold-500/40 sm:flex-row sm:items-center sm:gap-5"
    >
      {/* Logotip */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-brand-50 to-violet-50 text-lg font-bold text-brand-600 dark:border-slate-800 dark:from-brand-500/15 dark:to-violet-500/15 dark:text-brand-300">
        {c.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.logoUrl} alt={c.name} className="h-full w-full object-cover" />
        ) : (
          (c.name || "J").slice(0, 2).toUpperCase()
        )}
      </div>

      {/* Asosiy ma'lumot */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-slate-900 transition group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-gold-400 sm:truncate">
            {job.title}
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {c.name || t("list.noCompany")}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
            {job.isRemote ? t("list.remoteChip") : job.location || "—"}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            {salaryText(job.salaryMin, job.salaryMax, t)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Tag>{t(`list.jobTypes.${job.type}`)}</Tag>
          <Tag>{t(`list.exp.${job.experience}`)}</Tag>
          {job.isRemote && (
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              🏠 {t("list.remoteChip")}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 shrink-0 text-xs text-slate-400">
            <Clock size={12} />
            {timeAgo(job.createdAt, t)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Tag({ children }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}
