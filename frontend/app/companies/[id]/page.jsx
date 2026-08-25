"use client";

// Kompaniya profili + ochiq vakansiyalar
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import JobCard from "@/components/JobCard";
import { usePrefs, useT } from "@/lib/store";
import { sectorLabel, regionLabel } from "@/lib/constants";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const lang = usePrefs((s) => s.lang);
  const t = useT();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/companies/${id}`)
      .then(({ data }) => setCompany(data))
      .catch(() => setError(t("companies.notFoundPage")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) return <div className="py-32 text-center text-slate-400 dark:text-slate-500">{error}</div>;
  if (!company) return <div className="py-32 text-center text-slate-400 dark:text-slate-500">{t("common.loading")}</div>;

  return (
    <div>
      {/* Banner */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 pb-24 pt-16 dark:from-navy-900 dark:via-navy-950 dark:to-violet-950" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Profil kartasi */}
        <div className="card -mt-16 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="-mt-14 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-brand-100 to-violet-100 shadow-lg dark:border-slate-900 dark:from-brand-500/25 dark:to-violet-500/25">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-300">{company.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{company.name}</h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                {company.sector && <span>🏷️ {sectorLabel(company.sector, lang)}</span>}
                {company.location && <span>📍 {regionLabel(company.location, lang) || company.location}</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline dark:text-gold-400">
                    🔗 {t("companies.site")}
                  </a>
                )}
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-2xl font-extrabold text-brand-600 dark:text-gold-400">{company.openJobsCount}</p>
              <p className="text-xs text-slate-400">{t("companies.openJobsLabel")}</p>
            </div>
          </div>

          {company.description && (
            <div className="mt-6 whitespace-pre-wrap border-t border-slate-100 pt-6 leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
              {company.description}
            </div>
          )}
        </div>

        {/* Vakansiyalar */}
        <section className="mt-8 pb-8">
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">{t("companies.openVacancies")}</h2>
          {company.jobs.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              {t("companies.noOpen")}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {company.jobs.map((job) => (
                <JobCard key={job.id} job={{ ...job, company }} />
              ))}
            </div>
          )}
        </section>

        <Link href="/companies" className="inline-block pb-10 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-gold-400">
          {t("companies.backAll")}
        </Link>
      </div>
    </div>
  );
}
