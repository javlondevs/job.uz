"use client";

// Hero qidiruv paneli - tab toggle (Vakansiya joylash / Rezyume yuborish)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles, FileText, ArrowRight } from "lucide-react";
import { REGIONS, regionLabel } from "@/lib/constants";
import { usePrefs, useT } from "@/lib/store";

export default function HeroSearch() {
  const router = useRouter();
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const [tab, setTab] = useState("vacancy"); // vacancy | resume
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");

  // Qidiruv: ikkala matn maydoni birlashtirilib q parametriga beriladi
  const submit = (e) => {
    e.preventDefault();
    const query = [q.trim(), keyword.trim()].filter(Boolean).join(" ");
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (location) sp.set("location", location);
    router.push(`/jobs?${sp.toString()}`);
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      {/* Tab / toggle tugmalar - kulrang pill konteyner */}
      <div className="relative z-10 inline-flex rounded-full bg-slate-100 p-1.5 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700">
        <TabButton active={tab === "vacancy"} onClick={() => setTab("vacancy")}>
          {t("home.tabPost")}
        </TabButton>
        <TabButton active={tab === "resume"} onClick={() => setTab("resume")}>
          {t("home.tabCv")}
        </TabButton>
      </div>

      {/* Qidiruv paneli */}
      {tab === "vacancy" ? (
        <form
          onSubmit={submit}
          className="relative z-10 mt-6 flex flex-col gap-2 rounded-[1.75rem] bg-white p-3 shadow-2xl shadow-navy-950/[0.12] ring-1 ring-slate-100 dark:bg-slate-900 dark:shadow-black/40 dark:ring-slate-800 lg:flex-row lg:items-center lg:gap-0"
        >
          <Field icon={<Search size={18} className="shrink-0 text-gold-600" />}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("home.phProfession")}
              aria-label={t("home.ariaProfession")}
              className="w-full bg-transparent py-3 text-sm text-navy-950 placeholder-slate-400 outline-none dark:text-slate-100"
            />
          </Field>

          <Divider />

          <Field icon={<MapPin size={18} className="shrink-0 text-gold-600" />}>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label={t("home.ariaCity")}
              className={`w-full cursor-pointer appearance-none bg-transparent py-3 text-sm outline-none ${location ? "text-navy-950 dark:text-slate-100" : "text-slate-400"}`}
            >
              <option value="">{t("home.city")}</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{regionLabel(r, lang)}</option>
              ))}
            </select>
          </Field>

          <Divider />

          <Field icon={<Sparkles size={18} className="shrink-0 text-gold-600" />}>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t("home.phKeyword")}
              aria-label={t("home.ariaKeyword")}
              className="w-full bg-transparent text-sm text-navy-950 placeholder-slate-400 outline-none dark:text-slate-100"
            />
          </Field>

          <button type="submit" className="btn-gold shrink-0 whitespace-nowrap !rounded-2xl">
            {t("home.btnSearch")}
          </button>
        </form>
      ) : (
        <div className="relative z-10 mt-6 flex flex-col items-center gap-4 rounded-[1.75rem] bg-white p-7 text-center shadow-2xl shadow-navy-950/[0.12] ring-1 ring-slate-100 dark:bg-slate-900 dark:shadow-black/40 dark:ring-slate-800 sm:flex-row sm:text-left">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-600">
            <FileText size={24} />
          </span>
          <p className="flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("home.resumeText")}
          </p>
          <a href="/cv-builder" className="btn-gold shrink-0 whitespace-nowrap !rounded-2xl">
            {t("home.tabCv")}
            <ArrowRight size={16} />
          </a>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-navy-950 text-white shadow-md shadow-navy-950/25 dark:bg-gold-500 dark:text-navy-950"
          : "text-slate-500 hover:bg-white hover:text-navy-950 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ icon, children }) {
  return (
    <label className="group flex flex-1 items-center gap-2.5 rounded-2xl px-4 transition focus-within:bg-slate-50 hover:bg-slate-50 dark:focus-within:bg-slate-800/60 dark:hover:bg-slate-800/60">
      <span className="transition group-focus-within:scale-110">{icon}</span>
      {children}
    </label>
  );
}

function Divider() {
  return <span className="hidden h-8 w-px bg-slate-200 lg:block dark:bg-slate-700" />;
}
