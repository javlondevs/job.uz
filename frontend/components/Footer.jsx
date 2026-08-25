"use client";

// Footer - sayt pastki qismi
import Link from "next/link";
import { Shield } from "lucide-react";
import { useT } from "@/lib/store";

export default function Footer() {
  const t = useT();

  return (
    <footer className="mt-20 border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-950 text-gold-500 ring-2 ring-gold-500/60 dark:bg-gold-500 dark:text-navy-950">
              <Shield size={20} strokeWidth={2.2} fill="currentColor" fillOpacity={0.25} />
            </span>
            <span className="font-display text-lg font-extrabold tracking-wide text-navy-950 dark:text-white">
              JOB<span className="text-gold-600 dark:text-gold-400">UZ</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("footer.tagline")}
          </p>
        </div>

        <FooterCol
          title={t("footer.seekers")}
          links={[
            { href: "/jobs", label: t("footer.vacancies") },
            { href: "/cv-builder", label: t("footer.createCv") },
            { href: "/dashboard", label: t("footer.myApps") },
          ]}
        />
        <FooterCol
          title={t("footer.employers")}
          links={[
            { href: "/dashboard", label: t("footer.postVacancy") },
            { href: "/companies", label: t("footer.companies") },
            { href: "/login?tab=register&role=employer", label: t("footer.register") },
          ]}
        />
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("footer.tgTitle")}</h4>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {t("footer.tgText")}
          </p>
          <a
            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "jobuz_uz_bot"}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#229ED9] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <TgIcon /> {t("footer.goBot")}
          </a>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-sm text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} JobUz — {t("footer.rights")}
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-gold-400">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.9 4.6c.2-1-.7-1.8-1.6-1.4L2.7 10.1c-1 .4-1 1.9 0 2.3l4.4 1.4 1.7 5.4c.3.9 1.4 1.1 2 .4l2.5-2.7 4.5 3.3c.8.6 2 .2 2.2-.8L21.9 4.6zM9.4 13.4l8.7-5.9c.2-.2.5.2.3.4l-7.2 7-.3 2.9-1.5-4.4z"/>
    </svg>
  );
}
