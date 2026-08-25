"use client";

// Dashboard - rolga qarab: ish qidiruvchi (arizalar, obunalar) yoki ish beruvchi (kompaniya, vakansiyalar)
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth, useT } from "@/lib/store";
import AdminPanel from "@/components/AdminPanel";
import {
  JOB_TYPE_KEYS,
  EXPERIENCE_KEYS,
  REGIONS,
  SECTORS,
  formatDate,
  regionLabel,
  sectorLabel,
} from "@/lib/constants";
import { usePrefs } from "@/lib/store";

export default function DashboardPage() {
  const { user, refreshMe } = useAuth();
  const t = useT();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login?next=/dashboard");
    else refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user)
    return <div className="py-32 text-center text-slate-400 dark:text-slate-500">{t("common.loading")}</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Xush kelibsiz */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("dash.hello", { name: user.name })}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {user.role === "EMPLOYER" ? t("dash.employerPanel") : user.role === "ADMIN" ? t("dash.adminPanel") : t("dash.seekerPanel")}
          </p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${user.role === "EMPLOYER" ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" : user.role === "ADMIN" ? "bg-gold-100 text-gold-700 dark:bg-gold-500/20 dark:text-gold-300" : "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"}`}>
          {user.role === "EMPLOYER" ? t("dash.roleEmployer") : user.role === "ADMIN" ? t("dash.roleAdmin") : t("dash.roleSeeker")}
        </span>
      </div>

      {user.role === "EMPLOYER" ? <EmployerPanel user={user} /> : user.role === "ADMIN" ? <AdminPanel user={user} /> : <SeekerPanel user={user} />}
    </div>
  );
}

/* ==================== ISH QIDIRUVCHI PANELI ==================== */
function SeekerPanel({ user }) {
  const [apps, setApps] = useState([]);
  const [subs, setSubs] = useState([]);
  const [tgId, setTgId] = useState("");
  const t = useT();

  useEffect(() => {
    api.get("/api/applications/mine").then(({ data }) => setApps(data)).catch(() => {});
    api.get("/api/telegram/subscriptions").then(({ data }) => setSubs(data)).catch(() => {});
  }, []);

  async function addSub() {
    try {
      await api.post("/api/telegram/subscribe", {
        name: t("dash.filterName"),
        filters: {},
        telegramNotify: true,
        telegramId: tgId || undefined,
      });
      const { data } = await api.get("/api/telegram/subscriptions");
      setSubs(data);
      setTgId("");
    } catch (e) {
      alert(e.response?.data?.message || t("dash.subError"));
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
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{t("dash.myApps")}</h2>
        {apps.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-400">{t("dash.noApps")}</p>
            <Link href="/jobs" className="btn-primary mt-4 inline-flex">{t("dash.viewJobs")}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((a) => {
              return (
                <Link key={a.id} href={`/jobs/${a.job?.id}`} className="card flex items-center gap-4 p-4 transition hover:border-brand-200 dark:hover:border-gold-500/40">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    {a.job?.company?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.job.company.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (a.job?.company?.name || "J").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{a.job?.title}</p>
                    <p className="text-xs text-slate-400">{a.job?.company?.name} · {formatDate(a.createdAt)}</p>
                  </div>
                  <StatusPill status={a.status} />
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
          <h2 className="font-bold text-slate-900 dark:text-white">{t("dash.tgTitle")}</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {t("dash.tgText")}
          </p>
          <div className="mt-3 flex gap-2">
            <input className="input !py-2 !text-xs" placeholder={t("dash.tgIdPh")} value={tgId} onChange={(e) => setTgId(e.target.value)} />
            <button onClick={addSub} className="btn-primary shrink-0 !px-4 !py-2 !text-xs">{t("dash.subscribe")}</button>
          </div>

          <div className="mt-4 space-y-2">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s.name}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(s.filters?.createdAt || Date.now())} {t("common.created")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSub(s)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${s.telegramNotify ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}
                  >
                    {s.telegramNotify ? t("common.on") : t("common.off")}
                  </button>
                  <button onClick={() => removeSub(s.id)} className="text-xs text-slate-300 hover:text-rose-500 dark:text-slate-600">✕</button>
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
            {t("dash.goBot")}
          </a>
        </div>
      </aside>
    </div>
  );
}

/* Holat pill'i - tilga mos yorliq */
function StatusPill({ status }) {
  const t = useT();
  const cls = STATUS_CLS[status] || STATUS_CLS.PENDING;
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {t(`list.status.${status}`)}
    </span>
  );
}

const STATUS_CLS = {
  PENDING: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  REVIEWED: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  ACCEPTED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  REJECTED: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
};

/* ==================== ISH BERUVCHI PANELI ==================== */
function EmployerPanel({ user }) {
  const [company, setCompany] = useState(user.company);
  const [tab, setTab] = useState("jobs");
  const t = useT();

  // Kompaniya hali yo'q bo'lsa - yaratish formasi ko'rsatiladi
  if (!company) return <CreateCompany onDone={(c) => setCompany(c)} />;

  return (
    <div className="mt-6">
      {/* Kompaniya qatori */}
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-brand-50 font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            company.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900 dark:text-slate-100">{company.name}</p>
          <SectorLocation company={company} />
        </div>
        <Link href={`/companies/${company.id}`} className="btn-outline !py-2">{t("dash.viewProfile")}</Link>
        <EditCompany company={company} onDone={(c) => setCompany(c)} />
      </div>

      {/* Tablar */}
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:max-w-md">
        <TabBtn active={tab === "jobs"} onClick={() => setTab("jobs")}>{t("dash.tabJobs")}</TabBtn>
        <TabBtn active={tab === "create"} onClick={() => setTab("create")}>{t("dash.tabNew")}</TabBtn>
      </div>

      {tab === "jobs" ? <MyJobs /> : <JobForm onSaved={() => setTab("jobs")} />}
    </div>
  );
}

function SectorLocation({ company }) {
  const lang = usePrefs((s) => s.lang);
  const t = useT();
  return (
    <p className="text-xs text-slate-400">
      {company.sector ? sectorLabel(company.sector, lang) : t("dash.noSectorSet")}
      {company.location ? ` · ${regionLabel(company.location, lang) || company.location}` : ""}
    </p>
  );
}

function TabBtn({ active, children, ...props }) {
  return (
    <button {...props} className={`rounded-lg py-2.5 text-sm font-semibold transition ${active ? "bg-white shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
      {children}
    </button>
  );
}

/* --- Kompaniya yaratish --- */
function CreateCompany({ onDone }) {
  const lang = usePrefs((s) => s.lang);
  const t = useT();
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
      setError(e.response?.data?.message || t("common.error"));
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-8 max-w-xl p-7">
      <h2 className="text-center text-xl font-bold text-slate-900 dark:text-white">{t("dash.companyReg")}</h2>
      <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">{t("dash.companyNeed")}</p>

      <div className="mt-6 space-y-3">
        <input required className="input" placeholder={t("dash.namePh")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
            {SECTORS.map((s) => <option key={s} value={s}>{sectorLabel(s, lang)}</option>)}
          </select>
          <select className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
            <option value="">{t("dash.locationPh")}</option>
            {REGIONS.map((r) => <option key={r} value={r}>{regionLabel(r, lang)}</option>)}
          </select>
        </div>
        <input className="input" placeholder={t("dash.websitePh")} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        <textarea rows={3} className="input resize-none" placeholder={t("dash.aboutPh")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-6 text-sm text-slate-400 transition hover:border-brand-300 hover:text-brand-500 dark:border-slate-700 dark:hover:border-gold-500/50 dark:hover:text-gold-400">
          {logo ? `✅ ${logo.name}` : t("dash.uploadLogo")}
          <input type="file" accept="image/*" hidden onChange={(e) => setLogo(e.target.files[0])} />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      <button disabled={saving} className="btn-primary mt-5 w-full !py-3">{saving ? t("common.saving") : t("common.create")}</button>
    </form>
  );
}

/* --- Kompaniyani tahrirlash --- */
function EditCompany({ company, onDone }) {
  const lang = usePrefs((s) => s.lang);
  const t = useT();
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
      <button onClick={() => setOpen(true)} className="btn-outline !py-2">✏️ {t("common.edit")}</button>
      {open && (
        <Modal title={t("dash.editCompany")} onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("auth.fullNamePh")} />
            <select className="input" value={form.sector || ""} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
              {SECTORS.map((s) => <option key={s} value={s}>{sectorLabel(s, lang)}</option>)}
            </select>
            <textarea rows={3} className="input resize-none" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("dash.descPh")} />
            <label className="block cursor-pointer text-sm text-slate-400 hover:text-brand-500 dark:hover:text-gold-400">
              {t("dash.replaceLogo")}
              <input type="file" accept="image/*" hidden onChange={(e) => setForm({ ...form, newLogo: e.target.files[0] })} />
            </label>
            <button className="btn-primary w-full">{saving ? "..." : t("common.save")}</button>
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
  const t = useT();

  const load = () => api.get("/api/jobs/my").then(({ data }) => setJobs(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  async function toggleStatus(j) {
    await api.put(`/api/jobs/${j.id}`, { status: j.status === "OPEN" ? "CLOSED" : "OPEN" });
    load();
  }
  async function remove(id) {
    if (!confirm(t("dash.deleteConfirm"))) return;
    await api.delete(`/api/jobs/${id}`);
    load();
  }

  if (jobs.length === 0)
    return (
      <div className="card mt-6 p-12 text-center">
        <p className="text-slate-400">{t("dash.noJobs")}</p>
        <Link href="/dashboard" className="btn-primary mt-4 inline-flex">{t("dash.addNewJob")}</Link>
      </div>
    );

  return (
    <>
      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="card flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/jobs/${j.id}`} className="truncate font-semibold text-slate-800 hover:text-brand-700 dark:text-slate-100 dark:hover:text-gold-400">{j.title}</Link>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  j.status === "OPEN"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                }`}>
                  {j.status === "OPEN" ? t("common.open") : t("common.closed")}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {t(`list.jobTypes.${j.type}`)} · {formatDate(j.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs">
              <button onClick={() => setOpenApplicants(j)} className="btn-outline !px-3 !py-1.5">
                👥 {t("dash.appsBtn", { n: j._count.applications })}
              </button>
              <button onClick={() => toggleStatus(j)} className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                {j.status === "OPEN" ? t("common.close") : t("common.openAction")}
              </button>
              <button onClick={() => remove(j.id)} className="rounded-lg px-2 py-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-500/10">🗑️</button>
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
  const t = useT();

  useEffect(() => {
    api.get(`/api/applications/job/${job.id}`).then(({ data }) => setApps(data)).catch(() => {});
  }, [job]);

  async function setStatus(id, status) {
    await api.put(`/api/applications/${id}/status`, { status });
    const { data } = await api.get(`/api/applications/job/${job.id}`);
    setApps(data);
  }

  return (
    <Modal title={`${job.title} — ${t("dash.myApps")}`} onClose={onClose}>
      {apps.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">{t("dash.noAppsYet")}</p>
      ) : (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {apps.map((a) => {
            return (
              <div key={a.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{a.user?.name}</p>
                    <p className="text-xs text-slate-400">{a.user?.email}{a.user?.phone ? ` · ${a.user.phone}` : ""}</p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
                {a.coverLetter && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">"{a.coverLetter}"</p>}
                {a.cv && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-brand-600 dark:text-gold-400">CV: {a.cv.title}</summary>
                    <div className="mt-2 rounded-lg border border-slate-100 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      <b>{a.cv.personalInfo?.fullName}</b> — {a.cv.personalInfo?.position}
                      <br /><br />
                      <b>{t("dash.cvSkills")}</b> {(a.cv.skills || []).join(", ") || "—"}
                      {(a.cv.experience || []).length > 0 && (
                        <>
                          <br /><br /><b>{t("dash.cvExp")}</b>
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
                        a.status === s
                          ? "bg-brand-600 text-white dark:bg-gold-500 dark:text-navy-950"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}>
                      {t(`list.status.${s}`)}
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
  const lang = usePrefs((s) => s.lang);
  const t = useT();
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
      setMsg(e.response?.data?.message || t("common.error"));
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-6 max-w-2xl space-y-4 p-7">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{existing ? t("dash.editJob") : t("dash.newJob")}</h2>

      <input required className="input" placeholder={t("dash.titlePh")} value={form.title} onChange={set("title")} />

      <div className="grid grid-cols-2 gap-3">
        <input type="number" className="input" placeholder={t("dash.salaryFrom")} value={form.salaryMin} onChange={set("salaryMin")} />
        <input type="number" className="input" placeholder={t("dash.salaryTo")} value={form.salaryMax} onChange={set("salaryMax")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select className="input" value={form.type} onChange={set("type")}>
          {JOB_TYPE_KEYS.map((k) => <option key={k} value={k}>{t(`list.jobTypes.${k}`)}</option>)}
        </select>
        <select className="input" value={form.experience} onChange={set("experience")}>
          {EXPERIENCE_KEYS.map((k) => <option key={k} value={k}>{t(`list.exp.${k}`)}</option>)}
        </select>
      </div>

      <select className="input" value={form.location} onChange={set("location")}>
        <option value="">{t("dash.selectLocation")}</option>
        {REGIONS.map((r) => <option key={r} value={r}>{regionLabel(r, lang)}</option>)}
      </select>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 dark:bg-violet-500/10">
        <input type="checkbox" checked={!!form.isRemote} onChange={set("isRemote")} className="h-4 w-4 accent-brand-600 dark:accent-gold-500" />
        <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">🏠 {t("jobs.remoteWork")}</span>
      </label>

      <textarea required rows={7} className="input resize-none" placeholder={t("dash.descFull")} value={form.description} onChange={set("description")} />

      {msg && <p className="text-sm font-medium text-rose-500">{msg}</p>}

      <div className="rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800 dark:bg-gold-500/10 dark:text-gold-200">
        {t("dash.tgNote")}
      </div>

      <button disabled={saving} className="btn-primary w-full !py-3">
        {saving ? t("common.saving") : existing ? t("common.save") : t("dash.publish")}
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
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-700">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
