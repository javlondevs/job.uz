// Footer - sayt pastki qismi
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white font-bold">J</span>
            <span className="text-lg font-bold text-slate-900">Job<span className="text-brand-600">Uz</span></span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
            O'zbekistondagi eng qulay ish qidirish platformasi. Ish beruvchilar va mutaxassislarni bog'laymiz.
          </p>
        </div>

        <FooterCol
          title="Ish qidiruvchilar"
          links={[
            { href: "/jobs", label: "Vakansiyalar" },
            { href: "/cv-builder", label: "CV yaratish" },
            { href: "/dashboard", label: "Mening arizalarim" },
          ]}
        />
        <FooterCol
          title="Ish beruvchilar"
          links={[
            { href: "/dashboard", label: "Vakansiya joylash" },
            { href: "/companies", label: "Kompaniyalar" },
            { href: "/login?tab=register&role=employer", label: "Ro'yxatdan o'tish" },
          ]}
        />
        <div>
          <h4 className="text-sm font-bold text-slate-900">Telegram</h4>
          <p className="mt-3 text-sm text-slate-500">
            Yangi vakansiyalardan birinchilardan bo'lib xabar oling.
          </p>
          <a
            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "jobuz_uz_bot"}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#229ED9] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <TgIcon /> Botga o'tish
          </a>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} JobUz — Barcha huquqlar himoyalangan
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-slate-500 transition hover:text-brand-600">{l.label}</Link>
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
