"use client";

// Admin panel - statistika, foydalanuvchilar, kompaniyalar va vakansiyalar boshqaruvi
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatDate } from "@/lib/constants";
import { useAuth, usePrefs, useT } from "@/lib/store";

const ROLES = ["JOB_SEEKER", "EMPLOYER", "ADMIN"];

export default function AdminPanel({ user }) {
  const t = useT();
  const [tab, setTab] = useState("stats");

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:max-w-lg lg:grid-cols-4">
        <TabBtn active={tab === "stats"} onClick={() => setTab("stats")}>{t("dash.adminTabStats")}</TabBtn>
        <TabBtn active={tab === "users"} onClick={() => setTab("users")}>{t("dash.adminTabUsers")}</TabBtn>
        <TabBtn active={tab === "companies"} onClick={() => setTab("companies")}>🏢</TabBtn>
        <TabBtn active={tab === "jobs"} onClick={() => setTab("jobs")}>{t("dash.adminTabJobs")}</TabBtn>
      </div>

      {tab === "stats" && <Stats />}
      {tab === "users" && <UsersTable meId={user.id} />}
      {tab === "companies" && <CompaniesTable />}
      {tab === "jobs" && <JobsTable />}
    </div>
  );
}

function TabBtn({ active, children, ...props }) {
  return (
    <button {...props} className={`rounded-lg py-2.5 text-sm font-semibold transition ${active ? "bg-white shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
      {children}
    </button>
  );
}

/* ==================== STATISTIKA ==================== */
function Stats() {
  const t = useT();
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get("/api/admin/stats").then(({ data }) => setS(data)).catch(() => {});
  }, []);

  if (!s) return <div className="card mt-6 h-40 animate-pulse bg-slate-100/60 dark:bg-slate-800/60" />;

  const cards = [
    { label: t("dash.adminTotalUsers"), value: s.users, icon: "👥", cls: "from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-300" },
    { label: t("dash.adminTotalCompanies"), value: s.companies, icon: "🏢", cls: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-300" },
    { label: t("dash.adminOpenJobs"), value: s.openJobs, icon: "📂", cls: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-300" },
    { label: t("dash.adminTotalApps"), value: s.applications, icon: "📨", cls: "from-gold-500/20 to-gold-500/5 text-gold-600 dark:text-gold-300" },
  ];

  return (
    <div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`card bg-gradient-to-br p-5 dark:shadow-none ${c.cls}`}>
            <span className="text-2xl">{c.icon}</span>
            <p className="mt-2 text-3xl font-extrabold">{c.value}</p>
            <p className="mt-1 text-xs font-medium opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card mt-4 p-5">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <span>👤 {t("auth.seeker")}: <b>{s.roles.JOB_SEEKER}</b></span>
          <span>🏢 {t("auth.employer")}: <b>{s.roles.EMPLOYER}</b></span>
          <span>👑 Admin: <b>{s.roles.ADMIN}</b></span>
          <span>{t("dash.adminTotalJobs")}: <b>{s.jobs}</b></span>
        </div>
      </div>
    </div>
  );
}

/* ==================== FOYDALANUVCHILAR ==================== */
function UsersTable({ meId }) {
  const t = useT();
  const lang = usePrefs((s) => s.lang);
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const sp = new URLSearchParams({ page });
    if (q) sp.set("q", q);
    if (role) sp.set("role", role);
    api.get(`/api/admin/users?${sp}`).then(({ data }) => {
      setRows(data.data);
      setMeta(data.meta);
    }).catch(() => {});
  }, [q, role, page]);

  async function changeUserRole(id, r) {
    try {
      const { data } = await api.put(`/api/admin/users/${id}/role`, { role: r });
      setRows((x) => x.map((u) => (u.id === id ? { ...u, role: data.role } : u)));
    } catch (e) {
      alert(e.response?.data?.message || t("common.error"));
    }
  }

  async function impersonate(id) {
    try {
      const { data } = await api.post(`/api/admin/users/${id}/impersonate`);
      setSession({ token: data.token, user: data.user });
      window.location.href = "/dashboard";
    } catch (e) {
      alert(e.response?.data?.message || t("common.error"));
    }
  }

  async function removeUser(id) {
    if (!confirm(t("dash.adminDeleteUserConfirm"))) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setRows((x) => x.filter((u) => u.id !== id));
    } catch (e) {
      alert(e.response?.data?.message || t("common.error"));
    }
  }

  const roleChip = {
    JOB_SEEKER: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    EMPLOYER: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    ADMIN: "bg-gold-100 text-gold-700 dark:bg-gold-500/20 dark:text-gold-300",
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        <input className="input sm:max-w-xs" placeholder={t("companies.searchPh")} value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        <select className="input !w-auto" value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }}>
          <option value="">{t("dash.adminAllUsers")}</option>
          <option value="JOB_SEEKER">👤 {t("auth.seeker")}</option>
          <option value="EMPLOYER">🏢 {t("auth.employer")}</option>
          <option value="ADMIN">👑 Admin</option>
        </select>
      </div>

      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[740px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
              <th className="px-4 py-3 font-semibold">{t("dash.adminUsers")}</th>
              <th className="px-4 py-3 font-semibold">{t("dash.adminRole")}</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">{t("detail.appsCount", { n: "" })}</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">{t("dash.adminJoined")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("dash.adminActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className={`border-b border-slate-50 last:border-0 dark:border-slate-800/50 ${u.id === meId ? "bg-gold-500/[0.06]" : ""}`}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{u.name}{u.id === meId && <span className="ml-1 text-xs text-gold-600">(👑)</span>}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => changeUserRole(u.id, e.target.value)}
                    disabled={u.id === meId}
                    className={`cursor-pointer rounded-full border-none px-2.5 py-1 text-xs font-bold outline-none disabled:cursor-not-allowed ${roleChip[u.role]}`}
                  >
                    <option value="JOB_SEEKER">{t("dash.adminMakeSeeker")}</option>
                    <option value="EMPLOYER">{t("dash.adminMakeEmployer")}</option>
                    <option value="ADMIN">{t("dash.adminMakeAdmin")}</option>
                  </select>
                </td>
                <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                  📨 {u._count.applications} · 📄 {u._count.cvs}
                </td>
                <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">{formatDate(u.createdAt, lang)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => impersonate(u.id)}
                      disabled={u.id === meId}
                      className="rounded-lg px-2 py-1.5 text-slate-300 transition hover:bg-blue-50 hover:text-blue-500 disabled:opacity-30 dark:text-slate-600 dark:hover:bg-blue-500/10"
                      title={t("dash.loginAs")}
                    >
                      🔑
                    </button>
                    <button
                      onClick={() => removeUser(u.id)}
                      disabled={u.id === meId}
                      className="rounded-lg px-2 py-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30 dark:text-slate-600 dark:hover:bg-rose-500/10"
                      title={t("common.delete")}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">{t("jobs.none")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {meta?.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === meta.page ? "bg-brand-600 text-white dark:bg-gold-500 dark:text-navy-950" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== KOMPANIYALAR ==================== */
function CompaniesTable() {
  const t = useT();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const sp = new URLSearchParams({ page });
    if (q) sp.set("q", q);
    api.get(`/api/admin/companies?${sp}`).then(({ data }) => {
      setRows(data.data);
      setMeta(data.meta);
    }).catch(() => {});
  }, [q, page]);

  return (
    <div className="mt-6">
      <input className="input sm:max-w-xs" placeholder={t("companies.searchPh")} value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />

      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
              <th className="px-4 py-3 font-semibold">{t("auth.employer")}</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">Soha</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">Vakansiyalar</th>
              <th className="px-4 py-3 font-semibold">Egasi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
                <td className="px-4 py-3">
                  <Link href={`/companies/${c.id}`} className="font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-100 dark:hover:text-gold-400">
                    {c.name}
                  </Link>
                  {c.location && <p className="text-xs text-slate-400">{c.location}</p>}
                </td>
                <td className="hidden px-4 py-3 text-slate-500 md:table-cell">{c.sector || "—"}</td>
                <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">📂 {c._count.jobs}</td>
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{c.owner?.name || "—"}</p>
                  <p className="text-xs text-slate-400">{c.owner?.email || ""}</p>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">{t("jobs.none")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {meta?.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === meta.page ? "bg-brand-600 text-white dark:bg-gold-500 dark:text-navy-950" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== VAKANSIYALAR ==================== */
function JobsTable() {
  const t = useT();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const sp = new URLSearchParams({ page });
    if (q) sp.set("q", q);
    api.get(`/api/admin/jobs?${sp}`).then(({ data }) => {
      setRows(data.data);
      setMeta(data.meta);
    }).catch(() => {});
  }, [q, page]);

  async function toggleStatus(j) {
    const status = j.status === "OPEN" ? "CLOSED" : "OPEN";
    await api.put(`/api/admin/jobs/${j.id}/status`, { status });
    setRows((x) => x.map((r) => (r.id === j.id ? { ...r, status } : r)));
  }

  async function removeJob(id) {
    if (!confirm(t("dash.adminDeleteJobConfirm"))) return;
    await api.delete(`/api/admin/jobs/${id}`);
    setRows((x) => x.filter((r) => r.id !== id));
  }

  return (
    <div className="mt-6">
      <input className="input sm:max-w-xs" placeholder={t("dash.titlePh").replace(" *", "")} value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />

      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
              <th className="px-4 py-3 font-semibold">{t("dash.adminJobTitle")}</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">{t("dash.adminCompany")}</th>
              <th className="px-4 py-3 font-semibold">{t("dash.adminStatus")}</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">{t("dash.adminAppsCount")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("dash.adminActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((j) => (
              <tr key={j.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
                <td className="max-w-[220px] px-4 py-3">
                  <Link href={`/jobs/${j.id}`} className="truncate font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-100 dark:hover:text-gold-400">
                    {j.title}
                  </Link>
                  <p className="text-xs text-slate-400 md:hidden">{j.company?.name}</p>
                </td>
                <td className="hidden max-w-[160px] truncate px-4 py-3 text-slate-500 md:table-cell">{j.company?.name || "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(j)} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    j.status === "OPEN"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  }`}>
                    {j.status === "OPEN" ? t("common.open") : t("common.closed")}
                  </button>
                </td>
                <td className="hidden px-4 py-3 text-slate-500 md:table-cell">📨 {j._count.applications}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeJob(j.id)} className="rounded-lg px-2 py-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-500/10" title={t("common.delete")}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">{t("jobs.none")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {meta?.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === meta.page ? "bg-brand-600 text-white dark:bg-gold-500 dark:text-navy-950" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
