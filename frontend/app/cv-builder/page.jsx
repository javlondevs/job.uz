"use client";

// CV Builder - shaxsiy ma'lumot, tajriba, ta'lim, ko'nikmalar + jonli ko'rish + PDF
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth, useT } from "@/lib/store";
import CvPreview from "@/components/CvPreview";
import { downloadCvPdf } from "@/lib/pdf";

const TEMPLATES = [
  { id: "modern", name: "Modern", descKey: "cv.tplModernD" },
  { id: "classic", name: "Classic", descKey: "cv.tplClassicD" },
  { id: "minimal", name: "Minimal", descKey: "cv.tplMinimalD" },
];

export default function CvBuilderPage() {
  const { user } = useAuth();
  const t = useT();
  const [cv, setCv] = useState(() => emptyCv(t));
  const [savedList, setSavedList] = useState([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function emptyCv(translator) {
    return {
      id: null,
      title: translator ? translator("cv.defaultTitle") : "Mening CV im",
      template: "modern",
      personalInfo: { fullName: "", position: "", phone: "", email: "", address: "", about: "" },
      experience: [],
      education: [],
      skills: [],
      languages: [],
    };
  }

  // Login bo'lsa saqlangan CV'larni yuklash
  useEffect(() => {
    if (!user) return;
    api.get("/api/cv").then(({ data }) => {
      setSavedList(data);
      if (data[0]) setCv({ ...emptyCv(), ...data[0] });
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Ismni avtomatik to'ldirish
  useEffect(() => {
    if (user && !cv.personalInfo.fullName) {
      setCv((c) => ({ ...c, personalInfo: { ...c.personalInfo, fullName: user.name, email: user.email } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const setP = (k, v) => setCv((c) => ({ ...c, personalInfo: { ...c.personalInfo, [k]: v } }));

  // Ro'yxat elementlarini boshqarish
  function addItem(key, item) {
    setCv((c) => ({ ...c, [key]: [...c[key], item] }));
  }
  function updateItem(key, i, field, value) {
    setCv((c) => {
      const arr = [...c[key]];
      arr[i] = { ...arr[i], [field]: value };
      return { ...c, [key]: arr };
    });
  }
  function removeItem(key, i) {
    setCv((c) => ({ ...c, [key]: c[key].filter((_, idx) => idx !== i) }));
  }

  async function save() {
    if (!user) return setStatus(t("cv.needLogin"));
    setSaving(true);
    setStatus("");
    try {
      const payload = {
        title: cv.title,
        template: cv.template,
        personalInfo: cv.personalInfo,
        experience: cv.experience,
        education: cv.education,
        skills: cv.skills,
        languages: cv.languages,
      };
      const { data } = cv.id
        ? await api.put(`/api/cv/${cv.id}`, payload)
        : await api.post("/api/cv", payload);
      setCv({ ...emptyCv(), ...data });
      const list = await api.get("/api/cv");
      setSavedList(list.data);
      setStatus(t("cv.saved"));
    } catch (e) {
      setStatus(e.response?.data?.message || t("common.error"));
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Sarlavha */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("cv.title")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("cv.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!user && (
            <Link href="/login?next=/cv-builder" className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              {t("cv.loginToSave")}
            </Link>
          )}
          <button onClick={() => downloadCvPdf(cv)} className="btn-primary">{t("cv.downloadPdf")}</button>
          <button onClick={save} disabled={saving} className="btn-outline">
            {saving ? "..." : t("common.save")}
          </button>
        </div>
      </div>

      {status && (
        <p className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-medium ${status.startsWith("✅") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"}`}>
          {status}
        </p>
      )}

      {/* Saqlangan CV'lar */}
      {user && savedList.length > 1 && (
        <div className="card mt-4 flex flex-wrap items-center gap-2 p-4">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("cv.savedOnes")}</span>
          {savedList.map((s) => (
            <button
              key={s.id}
              onClick={() => setCv({ ...emptyCv(), ...s })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                s.id === cv.id
                  ? "bg-brand-600 text-white dark:bg-gold-500 dark:text-navy-950"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_560px]">
        {/* ===== FORMA ===== */}
        <div className="space-y-5">
          {/* Shablon tanlash */}
          <div className="card p-5">
            <h2 className="mb-3 font-bold text-slate-900 dark:text-slate-100">{t("cv.tpl")}</h2>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setCv((c) => ({ ...c, template: tpl.id }))}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    cv.template === tpl.id
                      ? "border-brand-500 bg-brand-50/50 dark:border-gold-500 dark:bg-gold-500/10"
                      : "border-slate-200 hover:border-brand-200 dark:border-slate-700 dark:hover:border-slate-500"
                  }`}
                >
                  <TemplateThumb id={tpl.id} />
                  <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">{tpl.name}</p>
                  <p className="text-[10px] leading-tight text-slate-400">{t(tpl.descKey)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Shaxsiy ma'lumot */}
          <div className="card p-5">
            <h2 className="mb-3 font-bold text-slate-900 dark:text-slate-100">{t("cv.personal")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder={t("cv.fullNamePh")} value={cv.personalInfo.fullName} onChange={(e) => setP("fullName", e.target.value)} />
              <input className="input" placeholder={t("cv.positionPh")} value={cv.personalInfo.position} onChange={(e) => setP("position", e.target.value)} />
              <input className="input" placeholder={t("cv.phonePh")} value={cv.personalInfo.phone} onChange={(e) => setP("phone", e.target.value)} />
              <input className="input" placeholder="Email" value={cv.personalInfo.email} onChange={(e) => setP("email", e.target.value)} />
              <input className="input sm:col-span-2" placeholder={t("cv.addressPh")} value={cv.personalInfo.address} onChange={(e) => setP("address", e.target.value)} />
              <textarea rows={3} className="input resize-none sm:col-span-2" placeholder={t("cv.aboutPh")} value={cv.personalInfo.about} onChange={(e) => setP("about", e.target.value)} />
            </div>
          </div>

          {/* Ish tajribasi */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">{t("cv.experience")}</h2>
              <button onClick={() => addItem("experience", { company: "", position: "", start: "", end: "", description: "" })} className="btn-outline !px-3 !py-1.5 !text-xs">{t("common.add")}</button>
            </div>
            {cv.experience.map((e, i) => (
              <div key={i} className="mb-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 last:mb-0 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className="input !bg-white dark:!bg-slate-900" placeholder={t("cv.companyPh")} value={e.company} onChange={(ev) => updateItem("experience", i, "company", ev.target.value)} />
                  <input className="input !bg-white dark:!bg-slate-900" placeholder={t("cv.positionShort")} value={e.position} onChange={(ev) => updateItem("experience", i, "position", ev.target.value)} />
                  <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                    <input className="input !bg-white dark:!bg-slate-900" placeholder={t("cv.startPh")} value={e.start} onChange={(ev) => updateItem("experience", i, "start", ev.target.value)} />
                    <input className="input !bg-white dark:!bg-slate-900" placeholder={t("cv.endPh")} value={e.end} onChange={(ev) => updateItem("experience", i, "end", ev.target.value)} />
                  </div>
                  <textarea rows={2} className="input !resize-none !bg-white dark:!bg-slate-900 sm:col-span-2" placeholder={t("cv.didPh")} value={e.description} onChange={(ev) => updateItem("experience", i, "description", ev.target.value)} />
                </div>
                <button onClick={() => removeItem("experience", i)} className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-600">{t("cv.delItem")}</button>
              </div>
            ))}
          </div>

          {/* Ta'lim */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">{t("cv.education")}</h2>
              <button onClick={() => addItem("education", { school: "", degree: "", start: "", end: "" })} className="btn-outline !px-3 !py-1.5 !text-xs">{t("common.add")}</button>
            </div>
            {cv.education.map((d, i) => (
              <div key={i} className="mb-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 last:mb-0 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className="input !bg-white dark:!bg-slate-900" placeholder={t("cv.schoolPh")} value={d.school} onChange={(ev) => updateItem("education", i, "school", ev.target.value)} />
                  <input className="input !bg-white dark:!bg-slate-900" placeholder={t("cv.degreePh")} value={d.degree} onChange={(ev) => updateItem("education", i, "degree", ev.target.value)} />
                  <input className="input !bg-white dark:!bg-slate-900" placeholder={t("cv.startPh")} value={d.start} onChange={(ev) => updateItem("education", i, "start", ev.target.value)} />
                  <input className="input !bg-white dark:!bg-slate-900" placeholder={t("cv.endPh")} value={d.end} onChange={(ev) => updateItem("education", i, "end", ev.target.value)} />
                </div>
                <button onClick={() => removeItem("education", i)} className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-600">{t("cv.delItem")}</button>
              </div>
            ))}
          </div>

          {/* Ko'nikmalar va tillar */}
          <div className="card space-y-4 p-5">
            <TagEditor label={t("cv.skills")} placeholder={t("cv.skillsPh")} items={cv.skills}
              onAdd={(v) => addItem("skills", v)}
              onRemove={(i) => removeItem("skills", i)}
            />
            <hr className="border-slate-100 dark:border-slate-800" />
            <TagEditor label={t("cv.languages")} placeholder={t("cv.languagesPh")} items={cv.languages}
              onAdd={(v) => addItem("languages", v)}
              onRemove={(i) => removeItem("languages", i)}
            />
          </div>

          {/* Rasm / Avatar yuklash */}
          <div className="card p-5">
            <h2 className="mb-3 font-bold text-slate-900 dark:text-slate-100">{t("cv.photo")}</h2>
            <div className="flex items-center gap-4">
              {cv.personalInfo.photo ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cv.personalInfo.photo} alt="Avatar" className="h-24 w-24 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700" />
                  <button
                    onClick={() => setP("photo", "")}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white text-xs shadow hover:bg-rose-600"
                  >×</button>
                </div>
              ) : (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-gold-500 dark:hover:bg-gold-500/10">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { setStatus("Rasm 5MB dan kichik bo'lishi kerak"); return; }
                      const reader = new FileReader();
                      reader.onload = (ev) => setP("photo", ev.target.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span className="mt-1 text-[10px] font-medium">{t("cv.uploadPhoto")}</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ===== JONLI KO'RINISH ===== */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">{t("cv.livePreview")}</div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-card dark:border-slate-700">
            <div className="a4-preview max-h-[75vh] overflow-hidden" style={{ aspectRatio: "auto", height: "1123px" }}>
              <CvPreview cv={cv} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Teg muharriri (ko'nikmalar/tillar uchun)
function TagEditor({ label, placeholder, items, onAdd, onRemove }) {
  const [val, setVal] = useState("");
  function add() {
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal("");
  }
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder={placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button type="button" onClick={add} className="btn-outline shrink-0">+</button>
      </div>
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-xs font-medium text-brand-700 dark:bg-gold-500/15 dark:text-gold-300">
              {s}
              <button type="button" onClick={() => onRemove(i)} className="rounded-full p-0.5 transition hover:bg-brand-200 dark:hover:bg-gold-500/30">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Kichik shablon oldindan ko'rinishi
function TemplateThumb({ id }) {
  if (id === "classic")
    return (
      <div className="h-14 rounded-md border border-slate-300 bg-white p-1.5 dark:border-slate-600">
        <div className="mx-auto h-1 w-8 rounded bg-slate-700" />
        <div className="mx-auto mt-1 h-0.5 w-12 rounded bg-slate-300" />
        <div className="mt-2 h-0.5 w-full rounded bg-slate-200" />
        <div className="mt-1 h-0.5 w-3/4 rounded bg-slate-200" />
        <div className="mt-1 h-0.5 w-full rounded bg-slate-200" />
      </div>
    );
  if (id === "minimal")
    return (
      <div className="h-14 rounded-md border border-slate-300 bg-white p-1.5 dark:border-slate-600">
        <div className="h-1 w-10 rounded bg-slate-800" />
        <div className="mt-1 h-0.5 w-6 rounded bg-slate-300" />
        <div className="mt-2 h-px w-full bg-slate-200" />
        <div className="mt-1.5 h-0.5 w-full rounded bg-slate-200" />
        <div className="mt-1 h-0.5 w-2/3 rounded bg-slate-200" />
      </div>
    );
  return (
    <div className="flex h-14 overflow-hidden rounded-md border border-slate-300 bg-white dark:border-slate-600">
      <div className="w-1/3 rounded-l-md bg-brand-600 p-1">
        <div className="h-0.5 w-4 rounded bg-white/80" />
        <div className="mt-1 h-0.5 w-3 rounded bg-white/50" />
      </div>
      <div className="flex-1 p-1.5">
        <div className="h-0.5 w-8 rounded bg-brand-400" />
        <div className="mt-1.5 h-0.5 w-full rounded bg-slate-200" />
        <div className="mt-1 h-0.5 w-3/4 rounded bg-slate-200" />
      </div>
    </div>
  );
}
