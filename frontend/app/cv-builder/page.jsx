"use client";

// CV Builder - shaxsiy ma'lumot, tajriba, ta'lim, ko'nikmalar + jonli ko'rish + PDF
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/lib/store";
import CvPreview from "@/components/CvPreview";
import { downloadCvPdf } from "@/lib/pdf";

const EMPTY = {
  id: null,
  title: "Mening CV im",
  template: "modern",
  personalInfo: { fullName: "", position: "", phone: "", email: "", address: "", about: "" },
  experience: [],
  education: [],
  skills: [],
  languages: [],
};

const TEMPLATES = [
  { id: "modern", name: "Modern", desc: "Rangli panel bilan zamonaviy" },
  { id: "classic", name: "Classic", desc: "Klassik serif uslub" },
  { id: "minimal", name: "Minimal", desc: "Sodda va toza" },
];

export default function CvBuilderPage() {
  const { user } = useAuth();
  const [cv, setCv] = useState(EMPTY);
  const [savedList, setSavedList] = useState([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  // Login bo'lsa saqlangan CV'larni yuklash
  useEffect(() => {
    if (!user) return;
    api.get("/api/cv").then(({ data }) => {
      setSavedList(data);
      if (data[0]) setCv({ ...EMPTY, ...data[0] });
    }).catch(() => {});
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
    if (!user) return setStatus("Saqlash uchun tizimga kiring");
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
      setCv({ ...EMPTY, ...data });
      const list = await api.get("/api/cv");
      setSavedList(list.data);
      setStatus("✅ Saqlandi!");
    } catch (e) {
      setStatus(e.response?.data?.message || "Xatolik yuz berdi");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Sarlavha */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CV Builder</h1>
          <p className="mt-1 text-sm text-slate-500">Ma'lumotlarni to'ldiring — natijani darhol ko'rib turing</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!user && (
            <Link href="/login?next=/cv-builder" className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
              Saqlash uchun kiring
            </Link>
          )}
          <button onClick={() => downloadCvPdf(cv)} className="btn-primary">⬇️ PDF yuklab olish</button>
          <button onClick={save} disabled={saving} className="btn-outline">
            {saving ? "..." : "💾 Saqlash"}
          </button>
        </div>
      </div>

      {status && (
        <p className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-medium ${status.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
          {status}
        </p>
      )}

      {/* Saqlangan CV'lar */}
      {user && savedList.length > 1 && (
        <div className="card mt-4 flex flex-wrap items-center gap-2 p-4">
          <span className="text-sm font-semibold text-slate-500">Saqlanganlar:</span>
          {savedList.map((s) => (
            <button
              key={s.id}
              onClick={() => setCv({ ...EMPTY, ...s })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                s.id === cv.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            <h2 className="mb-3 font-bold text-slate-900">1. Shablon</h2>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCv((c) => ({ ...c, template: t.id }))}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    cv.template === t.id ? "border-brand-500 bg-brand-50/50" : "border-slate-200 hover:border-brand-200"
                  }`}
                >
                  <TemplateThumb id={t.id} />
                  <p className="mt-2 text-sm font-bold text-slate-800">{t.name}</p>
                  <p className="text-[10px] leading-tight text-slate-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Shaxsiy ma'lumot */}
          <div className="card p-5">
            <h2 className="mb-3 font-bold text-slate-900">2. Shaxsiy ma'lumot</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="To'liq ism *" value={cv.personalInfo.fullName} onChange={(e) => setP("fullName", e.target.value)} />
              <input className="input" placeholder="Lavozim (masalan: Frontend dasturchi)" value={cv.personalInfo.position} onChange={(e) => setP("position", e.target.value)} />
              <input className="input" placeholder="Telefon" value={cv.personalInfo.phone} onChange={(e) => setP("phone", e.target.value)} />
              <input className="input" placeholder="Email" value={cv.personalInfo.email} onChange={(e) => setP("email", e.target.value)} />
              <input className="input sm:col-span-2" placeholder="Manzil (shahar)" value={cv.personalInfo.address} onChange={(e) => setP("address", e.target.value)} />
              <textarea rows={3} className="input resize-none sm:col-span-2" placeholder="O'zingiz haqingizda qisqacha..." value={cv.personalInfo.about} onChange={(e) => setP("about", e.target.value)} />
            </div>
          </div>

          {/* Ish tajribasi */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">3. Ish tajribasi</h2>
              <button onClick={() => addItem("experience", { company: "", position: "", start: "", end: "", description: "" })} className="btn-outline !px-3 !py-1.5 !text-xs">+ Qo'shish</button>
            </div>
            {cv.experience.map((e, i) => (
              <div key={i} className="mb-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 last:mb-0">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className="input !bg-white" placeholder="Kompaniya" value={e.company} onChange={(ev) => updateItem("experience", i, "company", ev.target.value)} />
                  <input className="input !bg-white" placeholder="Lavozim" value={e.position} onChange={(ev) => updateItem("experience", i, "position", ev.target.value)} />
                  <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                    <input className="input !bg-white" placeholder="Boshlanish (2020-01)" value={e.start} onChange={(ev) => updateItem("experience", i, "start", ev.target.value)} />
                    <input className="input !bg-white" placeholder="Tugash (bo'sh = hozirgacha)" value={e.end} onChange={(ev) => updateItem("experience", i, "end", ev.target.value)} />
                  </div>
                  <textarea rows={2} className="input !resize-none !bg-white sm:col-span-2" placeholder="Nimalar qildingiz?" value={e.description} onChange={(ev) => updateItem("experience", i, "description", ev.target.value)} />
                </div>
                <button onClick={() => removeItem("experience", i)} className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-600">✕ O'chirish</button>
              </div>
            ))}
          </div>

          {/* Ta'lim */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">4. Ta'lim</h2>
              <button onClick={() => addItem("education", { school: "", degree: "", start: "", end: "" })} className="btn-outline !px-3 !py-1.5 !text-xs">+ Qo'shish</button>
            </div>
            {cv.education.map((d, i) => (
              <div key={i} className="mb-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 last:mb-0">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className="input !bg-white" placeholder="O'quv muassasasi" value={d.school} onChange={(ev) => updateItem("education", i, "school", ev.target.value)} />
                  <input className="input !bg-white" placeholder="Mutaxassislik / daraja" value={d.degree} onChange={(ev) => updateItem("education", i, "degree", ev.target.value)} />
                  <input className="input !bg-white" placeholder="Boshlanish" value={d.start} onChange={(ev) => updateItem("education", i, "start", ev.target.value)} />
                  <input className="input !bg-white" placeholder="Tugatish" value={d.end} onChange={(ev) => updateItem("education", i, "end", ev.target.value)} />
                </div>
                <button onClick={() => removeItem("education", i)} className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-600">✕ O'chirish</button>
              </div>
            ))}
          </div>

          {/* Ko'nikmalar va tillar */}
          <div className="card space-y-4 p-5">
            <TagEditor label="5. Ko'nikmalar" placeholder="Masalan: React, Excel..." items={cv.skills}
              onAdd={(v) => addItem("skills", v)}
              onRemove={(i) => removeItem("skills", i)}
              onUpdate={(i, v) => setCv((c) => { const a=[...c.skills]; a[i]=v; return {...c, skills:a}; })}
            />
            <hr className="border-slate-100" />
            <TagEditor label="6. Tillar" placeholder="Masalan: Ingliz tili - B2" items={cv.languages}
              onAdd={(v) => addItem("languages", v)}
              onRemove={(i) => removeItem("languages", i)}
              onUpdate={(i, v) => setCv((c) => { const a=[...c.languages]; a[i]=v; return {...c, languages:a}; })}
            />
          </div>
        </div>

        {/* ===== JONLI KO'RINISH ===== */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">Jonli ko'rinish (A4)</div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-card">
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
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-xs font-medium text-brand-700">
              {s}
              <button type="button" onClick={() => onRemove(i)} className="rounded-full p-0.5 transition hover:bg-brand-200">×</button>
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
      <div className="h-14 rounded-md border border-slate-300 bg-white p-1.5">
        <div className="mx-auto h-1 w-8 rounded bg-slate-700" />
        <div className="mx-auto mt-1 h-0.5 w-12 rounded bg-slate-300" />
        <div className="mt-2 h-0.5 w-full rounded bg-slate-200" />
        <div className="mt-1 h-0.5 w-3/4 rounded bg-slate-200" />
        <div className="mt-1 h-0.5 w-full rounded bg-slate-200" />
      </div>
    );
  if (id === "minimal")
    return (
      <div className="h-14 rounded-md border border-slate-300 bg-white p-1.5">
        <div className="h-1 w-10 rounded bg-slate-800" />
        <div className="mt-1 h-0.5 w-6 rounded bg-slate-300" />
        <div className="mt-2 h-px w-full bg-slate-200" />
        <div className="mt-1.5 h-0.5 w-full rounded bg-slate-200" />
        <div className="mt-1 h-0.5 w-2/3 rounded bg-slate-200" />
      </div>
    );
  return (
    <div className="flex h-14 overflow-hidden rounded-md border border-slate-300 bg-white">
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
