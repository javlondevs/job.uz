"use client";

// Vakansiya detali sahifasi
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/lib/store";
import { JOB_TYPES, EXPERIENCE_LEVELS, salaryText, formatDate } from "@/lib/constants";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [myCvs, setMyCvs] = useState([]);
  const [cvId, setCvId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [msg, setMsg] = useState("");

  // Vakansiyani yuklash
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/jobs/${id}`);
        setJob(data);
      } catch {
        setError("Vakansiya topilmadi");
      }
    })();
  }, [id]);

  // Login bo'lsa CV'larimni olib kelamiz
  useEffect(() => {
    if (!user || user.role !== "JOB_SEEKER") return;
    api.get("/api/cv").then(({ data }) => {
      setMyCvs(data);
      if (data[0]) setCvId(data[0].id);
    }).catch(() => {});
  }, [user]);

  async function apply() {
    if (!user) return router.push("/login?next=/jobs/" + id);
    if (user.role === "EMPLOYER") return setMsg("Ish beruvchi ariza qoldirolmaydi 🙂");

    setApplying(true);
    setMsg("");
    try {
      await api.post("/api/applications", { jobId: id, cvId: cvId || undefined, coverLetter });
      setApplied(true);
    } catch (e) {
      setMsg(e.response?.data?.message || "Xatolik yuz berdi");
    }
    setApplying(false);
  }

  if (error) {
    return <div className="py-32 text-center text-slate-400">{error}</div>;
  }
  if (!job) {
    return <div className="py-32 text-center text-slate-400">Yuklanmoqda...</div>;
  }

  const c = job.company || {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <Link href="/jobs" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-brand-600">
        ← Vakansiyalarga qaytish
      </Link>

      {/* Sarlavha kartasi */}
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-brand-50 to-violet-50 text-2xl font-bold text-brand-600">
            {c.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logoUrl} alt={c.name} className="h-full w-full object-cover" />
            ) : (
              (c.name || "J").slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{job.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {c.id ? (
                <Link href={`/companies/${c.id}`} className="font-semibold text-brand-600 hover:text-brand-800">{c.name}</Link>
              ) : (
                <span>{c.name}</span>
              )}
              <span>📍 {job.isRemote ? "Masofaviy" : job.location}</span>
              <span>🗓️ {formatDate(job.createdAt)}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-lg font-bold text-emerald-600">{salaryText(job.salaryMin, job.salaryMax)}</p>
            <p className="mt-1 text-xs text-slate-400">{job._count?.applications ?? 0} ta ariza</p>
          </div>
        </div>

        {/* Teglar */}
        <div className="mt-5 flex flex-wrap gap-2">
          {job.isRemote && <Badge cls="bg-violet-50 text-violet-600">🏠 Masofaviy</Badge>}
          <Badge>{JOB_TYPES[job.type]}</Badge>
          <Badge>{EXPERIENCE_LEVELS[job.experience]}</Badge>
          {c.sector && <Badge>{c.sector}</Badge>}
        </div>

        {/* Tavsif */}
        <div className="mt-8 whitespace-pre-wrap border-t border-slate-100 pt-6 leading-relaxed text-slate-700">
          {job.description}
        </div>
      </div>

      {/* Ariza formasi */}
      <div className="card mt-6 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">Bu vakansiyaga ariza qoldirish</h2>

        {applied ? (
          <div className="mt-4 rounded-xl bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            ✅ Arizangiz yuborildi! Kompaniya ko'rib chiqqanda dashboard'da holatini ko'rasiz.
          </div>
        ) : user?.role === "EMPLOYER" ? (
          <p className="mt-3 text-sm text-slate-500">Ariza faqat ish qidiruvchilar uchun.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {!user && (
              <p className="rounded-xl bg-brand-50 px-5 py-3 text-sm text-brand-800">
                Ariza qoldirish uchun{" "}
                <Link href={`/login?next=/jobs/${id}`} className="font-bold underline">tizimga kiring</Link>{" "}
                yoki tez ro'yxatdan o'ting.
              </p>
            )}

            {user && myCvs.length > 0 && (
              <div>
                <label className="label">CV tanlang</label>
                <select value={cvId} onChange={(e) => setCvId(e.target.value)} className="input sm:max-w-md">
                  <option value="">CV yubormaslik</option>
                  {myCvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>{cv.title}</option>
                  ))}
                </select>
                <Link href="/cv-builder" className="ml-2 text-xs font-semibold text-brand-600 hover:underline">+ Yangi CV yaratish</Link>
              </div>
            )}

            <div>
              <label className="label">Xabar (ixtiyoriy)</label>
              <textarea
                rows={3}
                className="input resize-none"
                placeholder="Nima uchun siz mos kelishingiz haqida qisqacha yozing..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            {msg && <p className="text-sm font-medium text-rose-500">{msg}</p>}

            <button onClick={apply} disabled={applying} className="btn-primary !px-10">
              {applying ? "Yuborilmoqda..." : "🚀 Ariza yuborish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, cls = "bg-slate-100 text-slate-600" }) {
  return <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cls}`}>{children}</span>;
}
