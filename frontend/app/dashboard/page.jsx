"use client";

// Dashboard - rolga qarab: ish qidiruvchi (arizalar, obunalar) yoki ish beruvchi (kompaniya, vakansiyalar)
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/store";
import { APPLICATION_STATUS, JOB_TYPES, EXPERIENCE_LEVELS, REGIONS, SECTORS, formatDate } from "@/lib/constants";

export default function DashboardPage() {
  const { user, refreshMe } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login?next=/dashboard");
    else refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return <div className="py-32 text-center text-slate-400">Yuklanmoqda...</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Xush kelibsiz */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salom, {user.name}! 👋</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.role === "EMPLOYER" ? "Ish beruvchi paneli" : "Ish qidiruvchi paneli"}
          </p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${user.role === "EMPLOYER" ? "bg-violet-50 text-violet-700" : "bg-brand-50 text-brand-700"}`}>
          {user.role === "EMPLOYER" ? "🏢 ISH BERUVCHI" : "👤 ISH QIDIRUVCHI"}
        </span>
      </div>

      {user.role === "EMPLOYER" ? <EmployerPanel user={user} /> : <SeekerPanel user={user} />}
    </div>
  );
}

/* ==================== ISH QIDIRUVCHI PANELI ==================== */
function SeekerPanel({ user }) {
  const [apps, setApps] = useState([]);
  const [subs, setSubs] = useState([]);
  const [tgId, setTgId] = useState("");

  useEffect(() => {
    api.get("/api/applications/mine").then(({ data }) => setApps(data)).catch(() => {});
    api.get("/api/telegram/subscriptions").then(({ data }) => setSubs(data)).catch(() => {});
  }, []);

  async function addSub() {
    try {
      await api.post("/api/telegram/subscribe", {
        name: "Filtrim",
        filters: {},
        telegramNotify: true,
        telegramId: tgId || undefined,
      });
      const { data } = await api.get("/api/telegram/subscriptions");
      setSubs(data);
      setTgId("");
    } catch (e) {
      alert(e.response?.data?.message || "Xatolik");
    }
  }

  async function toggleSub(s) {
    await api.post("/api/telegram/subscribe", {
      id: s.id,
      name: s.name,
      filters: s.filters,
      telegramNotify: !s.telegramNotify,
    });
    const { data } = await api.get("/api/telegram/subscriptions");
    setSubs(data);
  }

  async function removeSub(id) {
    await api.delete(`/api/telegram/subscribe/${id}`);
    setSubs((x) => x.filter((s) => s.id !== id));
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Arizalarim */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Arizalarim</h2>
        {apps.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-400">Hozircha ariza yo'q.</p>
            <Link href="/jobs" className="btn-primary mt-4 inline-flex">Vakansiyalarni ko'rish</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((a) => {
              const st = APPLICATION_STATUS[a.status];
              return (
                <Link key={a.id} href={`/jobs/${a.job?.id}`} className="card flex items-center gap-4 p-4 transition hover:border-brand-200">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-sm font-bold text-brand-600">
                    {a.job?.company?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.job.company.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (a.job?.company?.name || "J").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{a.job?.title}</p>
                    <p className="text-xs text-slate-400">{a.job?.company?.name} · {formatDate(a.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                </Link>
              );
            })}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Link href="/cv-builder" className="btn-outline">📄 CV Builder</Link>
        </div>
      </section>

      {/* Telegram obuna */}
      <aside className="space-y-5">
        <div className="card p-5">
          <h2 className="font-bold text-slate-900">🔔 Telegram bildirishnomalar</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Botga /start yuboring va Telegram ID'ngizni bu yerga kiritib obuna yarating —
            filtrlaringizga mos yangi vakansiyalar botga tushadi.
          </p>
          <div className="mt-3 flex gap-2">
            <input className="input !py-2 !text-xs" placeholder="Telegram ID (masalan: 123456789)" value={tgId} onChange={(e) => setTgId(e.target.value)} />
            <button onClick={addSub} className="btn-primary shrink-0 !px-4 !py-2 !text-xs">+ Obuna</button>
          </div>

          <div className="mt-4 space-y-2">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{s.name}</p>
                  <p className="text-[10px] text-slate-400">{new Date(s.filters?.createdAt || Date.now()).toLocaleDateString("uz-UZ")} da yaratilgan</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSub(s)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${s.telegramNotify ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}`}
                  >
                    {s.telegramNotify ? "YONIQ" : "O'CHIQ"}
                  </button>
                  <button onClick={() => removeSub(s.id)} className="text-xs text-slate-300 hover:text-rose-500">✕</button>
                </div>
              </div>
            ))}
          </div>

          <a
            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "jobuz_uz_bot"}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block rounded-xl bg-[#229ED9] py-2.5 text-center text-sm font-semibold text-white transition hover:brightness-110"
          >
            Botga o'tish →
          </a>
        </div>
      </aside>
    </div>
  );
}

/* ==================== ISH BERUVCHI PANELI ==================== */
function EmployerPanel({ user }) {
  const [company, setCompany] = useState(user.company);
  const [tab, setTab] = useState("jobs");

  // Kompaniya hali yo'q bo'lsa - yaratish formasi ko'rsatiladi
  if (!company) return <CreateCompany onDone={(c) => setCompany(c)} />;

  return (
    <div className="mt-6">
      {/* Kompaniya qatori */}
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-brand-50 font-bold text-brand-600">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            company.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900">{company.name}</p>
          <p className="text-xs text-slate-400">{company.sector || "Soha ko'rsatilmagan"}{company.location ? ` · ${company.location}` : ""}</p>
        </div>
        <Link href={`/companies/${company.id}`} className="btn-outline !py-2">Profilni ko'rish</Link>
        <EditCompany company={company} onDone={(c) => setCompany(c)} />
      </div>

      {/* Tablar */}
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:max-w-md">
        <TabBtn active={tab === "jobs"} onClick={() => setTab("jobs")}>💼 Vakansiyalar</TabBtn>
        <TabBtn active={tab === "create"} onClick={() => setTab("create")}>➕ Yangi vakansiya</TabBtn>
      </div>

      {tab === "jobs" ? <MyJobs /> : <JobForm onSaved={() => setTab("jobs")} />}
    </div>
  );
}

function TabBtn({ active, children, ...props }) {
  return (
    <button {...props} className={`rounded-lg py-2.5 text-sm font-semibold transition ${active ? "bg-white shadow-sm" : "text-slate-500"}`}>
      {children}
    </button>
  );
}

/* --- Kompaniya yaratish --- */
function CreateCompany({ onDone }) {
  const [form, setForm] = useState({ name: "", sector: SECTORS[0], location: "", website: "", description: "" });
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append("logo", logo);
      const { data } = await api.post("/api/companies", fd);
      onDone(data);
    } catch (e) {
      setError(e.response?.data?.message || "Xatolik");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-8 max-w-xl p-7">
      <h2 className="text-center text-xl font-bold text-slate-900">Kompaniyangizni ro'yxatdan o'tkazing 🏢</h2>
      <p className="mt-1 text-center text-sm text-slate-500">Vakansiya joylash uchun avval kompaniya profili kerak</p>

      <div className="mt-6 space-y-3">
        <input required className="input" placeholder="Kompaniya nomi *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
            {SECTORS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
            <option value="">Lokatsiya...</option>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <input className="input" placeholder="Veb-sayt (ixtiyoriy)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        <textarea rows={3} className="input resize-none" placeholder="Kompaniya haqida..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-6 text-sm text-slate-400 transition hover:border-brand-300 hover:text-brand-500">
          {logo ? `✅ ${logo.name}` : "🖼️ Logotip yuklash (ixtiyoriy)"}
          <input type="file" accept="image/*" hidden onChange={(e) => setLogo(e.target.files[0])} />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      <button disabled={saving} className="btn-primary mt-5 w-full !py-3">{saving ? "Saqlanmoqda..." : "Yaratish"}</button>
    </form>
  );
}

/* --- Kompaniyani tahrirlash --- */
function EditCompany({ company, onDone }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(company);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      ["name", "sector", "location", "website", "description"].forEach((k) => fd.append(k, form[k] || ""));
      if (form.newLogo) fd.append("logo", form.newLogo);
      const { data } = await api.put(`/api/companies/${company.id}`, fd);
      onDone(data);
      setOpen(false);
    } catch {}
    setSaving(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-outline !py-2">✏️ Tahrirlash</button>
      {open && (
        <Modal title="Kompaniyani tahrirlash" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nomi" />
            <select className="input" value={form.sector || ""} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <textarea rows={3} className="input resize-none" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tavsif" />
            <label className="block cursor-pointer text-sm text-slate-400 hover:text-brand-500">
              🖼️ Logotipni almashtirish
              <input type="file" accept="image/*" hidden onChange={(e) => setForm({ ...form, newLogo: e.target.files[0] })} />
            </label>
            <button className="btn-primary w-full">{saving ? "..." : "Saqlash"}</button>
          </form>
        </Modal>
      )}
    </>
  );
}

/* --- Vakansiyalarim + arizalarini ko'rish --- */
function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [openApplicants, setOpenApplicants] = useState(null);

  const load = () => api.get("/api/jobs/my").then(({ data }) => setJobs(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  async function toggleStatus(j) {
    await api.put(`/api/jobs/${j.id}`, { status: j.status === "OPEN" ? "CLOSED" : "OPEN" });
    load();
  }
  async function remove(id) {
    if (!confirm("O'chirilsinmi?")) return;
    await api.delete(`/api/jobs/${id}`);
    load();
  }

  if (jobs.length === 0)
    return (
      <div className="card mt-6 p-12 text-center">
        <p className="text-slate-400">Hozircha vakansiya yo'q</p>
        <Link href="/dashboard" className="btn-primary mt-4 inline-flex">Yangi vakansiya qo'shish</Link>
      </div>
    );

  return (
    <>
      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="card flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/jobs/${j.id}`} className="truncate font-semibold text-slate-800 hover:text-brand-700">{j.title}</Link>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  j.status === "OPEN" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                }`}>
                  {j.status === "OPEN" ? "OCHIQ" : "YOPILGAN"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {JOB_TYPES[j.type]} · {formatDate(j.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs">
              <button onClick={() => setOpenApplicants(j)} className="btn-outline !px-3 !py-1.5">
                👥 Arizalar ({j._count.applications})
              </button>
              <button onClick={() => toggleStatus(j)} className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-200">
                {j.status === "OPEN" ? "Yopish" : "Ochish"}
              </button>
              <button onClick={() => remove(j.id)} className="rounded-lg px-2 py-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {openApplicants && (
        <Applicants job={openApplicants} onClose={() => setOpenApplicants(null)} />
      )}
    </>
  );
}

/* --- Vakansiya bo'yicha arizalar --- */
function Applicants({ job, onClose }) {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    api.get(`/api/applications/job/${job.id}`).then(({ data }) => setApps(data)).catch(() => {});
  }, [job]);

  async function setStatus(id, status) {
    await api.put(`/api/applications/${id}/status`, { status });
    const { data } = await api.get(`/api/applications/job/${job.id}`);
    setApps(data);
  }

  return (
    <Modal title={`Arizalar — ${job.title}`} onClose={onClose}>
      {apps.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Hozircha ariza yo'q</p>
      ) : (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {apps.map((a) => {
            const st = APPLICATION_STATUS[a.status];
            return (
              <div key={a.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-800">{a.user?.name}</p>
                    <p className="text-xs text-slate-400">{a.user?.email}{a.user?.phone ? ` · ${a.user.phone}` : ""}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                </div>
                {a.coverLetter && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">"{a.coverLetter}"</p>}
                {a.cv && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-brand-600">CV: {a.cv.title}</summary>
                    <div className="mt-2 rounded-lg border border-slate-100 p-3 text-xs leading-relaxed text-slate-600">
                      <b>{a.cv.personalInfo?.fullName}</b> — {a.cv.personalInfo?.position}
                      <br /><br />
                      <b>Ko'nikmalar:</b> {(a.cv.skills || []).join(", ") || "—"}
                      {(a.cv.experience || []).length > 0 && (
                        <>
                          <br /><br /><b>Tajriba:</b>
                          {(a.cv.experience || []).map((e, i) => (
                            <span key={i}><br />• {e.position}, {e.company} ({e.start}—{e.end})</span>
                          ))}
                        </>
                      )}
                    </div>
                  </details>
                )}
                <div className="mt-3 flex gap-1.5">
                  {["REVIEWED", "ACCEPTED", "REJECTED"].map((s) => (
                    <button key={s} onClick={() => setStatus(a.id, s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        a.status === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}>
                      {APPLICATION_STATUS[s].label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

/* --- Yangi vakansiya formasi --- */
export function JobForm({ onSaved, existing }) {
  const [form, setForm] = useState(
    existing || {
      title: "",
      description: "",
      salaryMin: "",
      salaryMax: "",
      type: "FULL_TIME",
      experience: "NO_EXPERIENCE",
      location: "",
      isRemote: false,
    }
  );
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      if (existing) await api.put(`/api/jobs/${existing.id}`, form);
      else await api.post("/api/jobs", form);
      onSaved?.(true);
    } catch (e) {
      setMsg(e.response?.data?.message || "Xatolik");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-6 max-w-2xl space-y-4 p-7">
      <h2 className="text-lg font-bold text-slate-900">{existing ? "Vakansiyani tahrirlash" : "Yangi vakansiya"}</h2>

      <input required className="input" placeholder="Sarlavha (masalan: Frontend dasturchi) *" value={form.title} onChange={set("title")} />

      <div className="grid grid-cols-2 gap-3">
        <input type="number" className="input" placeholder="Maosh dan (so'm)" value={form.salaryMin} onChange={set("salaryMin")} />
        <input type="number" className="input" placeholder="Maosh gacha (so'm)" value={form.salaryMax} onChange={set("salaryMax")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select className="input" value={form.type} onChange={set("type")}>
          {Object.entries(JOB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input" value={form.experience} onChange={set("experience")}>
          {Object.entries(EXPERIENCE_LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <select className="input" value={form.location} onChange={set("location")}>
        <option value="">Lokatsiya tanlang...</option>
        {REGIONS.map((r) => <option key={r}>{r}</option>)}
      </select>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-violet-50 px-4 py-3">
        <input type="checkbox" checked={!!form.isRemote} onChange={set("isRemote")} className="h-4 w-4 accent-brand-600" />
        <span className="text-sm font-semibold text-violet-700">🏠 Masofaviy ish</span>
      </label>

      <textarea required rows={7} className="input resize-none" placeholder="To'liq tavsif: majburiyatlar, talablar, sharoitlar... *" value={form.description} onChange={set("description")} />

      {msg && <p className="text-sm font-medium text-rose-500">{msg}</p>}

      <div className="rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800">
        💡 Saqlanganda vakansiya Telegram kanalingizga avtomatik post qilinadi (token sozlangan bo'lsa).
      </div>

      <button disabled={saving} className="btn-primary w-full !py-3">
        {saving ? "Saqlanmoqda..." : existing ? "Saqlash" : "🚀 E'lon qilish"}
      </button>
    </form>
  );
}

/* --- Umumiy modal --- */
function Modal({ title, children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
