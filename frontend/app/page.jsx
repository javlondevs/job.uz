// Bosh sahifa - hero + qidiruv + kategoriyalar + yangi vakansiyalar
import Link from "next/link";
import api from "@/lib/api";
import JobCard from "@/components/JobCard";
import { SECTORS, REGIONS } from "@/lib/constants";

export const dynamic = "force-dynamic"; // har safar yangi ma'lumot

const sectorIcons = {
  "IT va Dasturlash": "💻",
  "Moliya va Bank": "🏦",
  "Ta'lim": "🎓",
  "Tibbiyot": "🩺",
  "Marketing va Sotuv": "📈",
  "Ishlab chiqarish": "🏭",
  "Qurilish": "🏗️",
  "Transport va Logistika": "🚚",
  "Xizmat ko'rsatish": "🛎️",
  "Boshqa": "✨",
};

async function getLatestJobs() {
  try {
    const { data } = await api.get("/api/jobs?limit=6&sort=new");
    return data.data || [];
  } catch {
    return []; // backend o'chsa ham sahifa ochiladi
  }
}

export default async function HomePage() {
  const jobs = await getLatestJobs();

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Fon effektlari */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-brand-200 backdrop-blur">
              🇺🇿 O'zbekiston bo'ylab <b className="text-white">1000+</b> vakansiya
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Orzuyingizdagi ishni
              <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent"> bugun toping</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              Ish qidiruvchilar uchun qulay filtr va CV builder. Ish beruvchilar uchun
              bir necha daqiqada vakansiya joylash va Telegram orqali millionlarga yetkazish.
            </p>

            {/* Qidiruv formasi */}
            <form action="/jobs" method="get" className="mt-10 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl shadow-black/30 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 px-2">
                <SearchIcon />
                <input
                  name="q"
                  placeholder="Kasbiyot, kompaniya yoki kalit so'z..."
                  className="w-full bg-transparent py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
              </div>
              <select name="location" className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none sm:w-44">
                <option value="">Butun O'zbekiston</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button type="submit" className="btn-primary !px-8">Qidirish</button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <Link href="/jobs?isRemote=true" className="transition hover:text-white">🏠 Masofaviy ishlar</Link>
              <Link href="/jobs?experience=NO_EXPERIENCE" className="transition hover:text-white">🌱 Tajribasiz</Link>
              <Link href="/cv-builder" className="transition hover:text-white">📄 CV yarating</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KATEGORIYALAR ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader title="Sohalar bo'yicha" link="/jobs" linkText="Barchasi →" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SECTORS.slice(0, 10).map((s) => (
            <Link
              key={s}
              href={`/jobs?sector=${encodeURIComponent(s)}`}
              className="card flex items-center gap-3 px-4 py-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft"
            >
              <span className="text-2xl">{sectorIcons[s] ?? "✨"}</span>
              <span className="text-sm font-medium leading-tight text-slate-700">{s}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== YANGI VAKANSIYALAR ===== */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader title="🆕 Yangi vakansiyalar" link="/jobs" linkText="Hammasini ko'rish →" />
          {jobs.length === 0 ? (
            <p className="py-12 text-center text-slate-400">
              Hozircha vakansiyalar yo'q. Backend ishga tushirilganini tekshiring.
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

      {/* ===== QANDAY ISHLAYDI ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">Qanday ishlaydi?</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Step n="1" icon="📝" title="Profil yarating" text="Ro'yxatdan o'ting, CV builder bilan professional rezyume yasang." />
          <Step n="2" icon="🔎" title="Qidiring va filtrlab ko'ring" text="Viloyat, soha, maosh va ish turi bo'yicha eng mos vakansiyani toping." />
          <Step n="3" icon="🚀" title="Ariza yuboring" text="Bir bosishda ariza qoldiring va Telegram orqali javob kuzating." />
        </div>
      </section>

      {/* ===== ISH BERUVCHILAR UCHUN CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 px-8 py-14 text-center shadow-card">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="text-3xl font-bold text-white">Siz ish beruvchimisiz?</h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-100">
            Kompaniyangizni ro'yxatdan o'tkazing, vakansiyalarni joylashtiring.
            Har bir yangi vakansiya Telegram kanalimizga avtomatik tushadi.
          </p>
          <Link href="/login?tab=register&role=employer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-brand-700 shadow-lg transition hover:bg-brand-50 active:scale-[0.98]">
            Bepul boshlash →
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, link, linkText }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <Link href={link} className="text-sm font-semibold text-brand-600 transition hover:text-brand-800">
        {linkText}
      </Link>
    </div>
  );
}

function Step({ n, icon, title, text }) {
  return (
    <div className="card relative p-6">
      <span className="absolute right-5 top-4 text-4xl font-extrabold text-slate-50">{n}</span>
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4-4" />
    </svg>
  );
}
