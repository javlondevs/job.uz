"use client";

// Bosh sahifaning klient qismi - til va temaga mos render
import Link from "next/link";
import JobCard from "@/components/JobCard";
import HeroSearch from "@/components/HeroSearch";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/store";

export default function HomeClient({ jobs }) {
  const t = useT();

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-slate-50 dark:from-slate-900 dark:via-slate-950/60 dark:to-slate-950">
        {/* Nuqtali grid naqsh */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1a233212_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#ffffff14_1px,transparent_1px)]" />
        {/* Nuqtalarni chetlarda yopuvchi yorug' qatlam */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,white_85%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_35%,#020617_85%)]" />
        {/* Yumshoq rang dog'lari */}
        <div className="pointer-events-none absolute -left-32 top-16 h-96 w-96 rounded-full bg-gold-500/[0.12] blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-40 h-80 w-80 rounded-full bg-navy-950/[0.07] blur-3xl dark:bg-gold-500/[0.06]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:pt-24">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            {/* Sarlavha + oltin chiziq akssenti */}
            <h1 className="font-display text-4xl font-extrabold uppercase leading-[1.12] tracking-tight text-navy-950 dark:text-white sm:text-5xl lg:text-[64px]">
              {t("home.title1")}{" "}
              <span className="relative inline-block whitespace-nowrap">
                {t("home.highlight")}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 14"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2.5 left-0 h-3 w-full text-gold-500"
                >
                  <path
                    d="M4 10C70 3.5 150 3.5 216 9"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500 dark:text-slate-400">
              {t("home.subtitle")}
            </p>

            {/* Tab toggle + qidiruv paneli */}
            <HeroSearch />
          </div>

          {/* JOBUZ watermark — shaffof, fon sifatida */}
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-0 -mt-8 select-none overflow-hidden whitespace-nowrap text-center font-display text-[27vw] font-black uppercase leading-[0.74] tracking-tighter text-navy-950/[0.045] sm:-mt-12 sm:text-[21vw] lg:-mt-16 lg:text-[240px] dark:text-white/[0.05]"
          >
            JOB<span className="text-gold-500/20">UZ</span>
          </div>
        </div>
      </section>

      {/* ===== XIZMATLAR ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <ServiceCard index="01" title={t("home.s1t")} text={t("home.s1d")} />
          <ServiceCard index="02" title={t("home.s2t")} text={t("home.s2d")} />
        </div>
      </section>

      {/* ===== YANGI VAKANSIYALAR ===== */}
      <section className="bg-white py-16 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="hidden w-1.5 self-stretch rounded-full bg-gold-500 sm:block" />
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-gold-600">{t("home.newBadge")}</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-navy-950 dark:text-white sm:text-3xl">
                  {t("home.latest")}
                </h2>
              </div>
            </div>
            <Link
              href="/jobs"
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-navy-950/15 px-4 py-2 text-sm font-semibold text-navy-950 transition hover:border-navy-950 hover:bg-navy-950 hover:text-white dark:border-slate-600 dark:text-slate-200 dark:hover:border-gold-500 dark:hover:bg-transparent dark:hover:text-gold-400"
            >
              {t("home.viewAll")}
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <p className="py-12 text-center text-slate-400">
              {t("home.empty")}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* Xizmat kartasi - oq fon, yumshoq soya, yumaloq burchaklar */
function ServiceCard({ index, title, text }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-card ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-navy-950/[0.09] hover:ring-gold-400/60 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-gold-500/40">
      {/* Raqam akssenti */}
      <span
        aria-hidden="true"
        className="absolute right-7 top-5 font-display text-6xl font-black leading-none tracking-tight text-slate-100 transition-colors duration-300 group-hover:text-gold-100 dark:text-slate-800 dark:group-hover:text-gold-500/25"
      >
        {index}
      </span>

      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#229ED9]/10 text-[#229ED9] transition duration-300 group-hover:scale-105 group-hover:bg-[#229ED9] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#229ED9]/30">
        <TgIcon />
      </span>

      <h3 className="mt-6 font-display text-xl font-bold text-navy-950 dark:text-slate-100">{title}</h3>
      <p className="mt-2.5 leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

/* Telegram ikonkasi */
function TgIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.9 4.6c.2-1-.7-1.8-1.6-1.4L2.7 10.1c-1 .4-1 1.9 0 2.3l4.4 1.4 1.7 5.4c.3.9 1.4 1.1 2 .4l2.5-2.7 4.5 3.3c.8.6 2 .2 2.2-.8L21.9 4.6zM9.4 13.4l8.7-5.9c.2-.2.5.2.3.4l-7.2 7-.3 2.9-1.5-4.4z" />
    </svg>
  );
}
