"use client";

// Kirish / Ro'yxatdan o'tish + Telegram orqali kirish
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/lib/store";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-slate-400">Yuklanmoqda...</div>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { setSession, user } = useAuth();
  const [tab, setTab] = useState(params.get("tab") === "register" ? "register" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: params.get("role") === "employer" ? "EMPLOYER" : "JOB_SEEKER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Allaqachon kirgan bo'lsa dashboard'ga
  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  // Telegram Login Widget skriptini yuklash
  useEffect(() => {
    window.onTelegramAuth = async (tgUser) => {
      setError("");
      try {
        const { data } = await api.post("/api/telegram/login", tgUser);
        setSession(data);
        router.push("/dashboard");
      } catch (e) {
        setError(e.response?.data?.message || "Telegram orqali kirish amalga oshmadi");
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "jobuz_uz_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    document.getElementById("tg-login")?.appendChild(script);
    return () => delete window.onTelegramAuth;
  }, [router, setSession]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post(`/api/auth/${tab}`, form);
      setSession(data);
      router.push(params.get("next") || "/dashboard");
    } catch (e) {
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    }
    setLoading(false);
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {tab === "login" ? "Xush kelibsiz 👋" : "JobUz'ga qo'shilish"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {tab === "login" ? "Hisobingizga kiring" : "Bir daqiqada ro'yxatdan o'ting"}
          </p>
        </div>

        {/* Tab tugmalari */}
        <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setTab("login")}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${tab === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}
          >
            Kirish
          </button>
          <button
            onClick={() => setTab("register")}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${tab === "register" ? "bg-white shadow-sm" : "text-slate-500"}`}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {/* Forma */}
        <form onSubmit={submit} className="card mt-4 space-y-4 p-6">
          {tab === "register" && (
            <>
              <div>
                <label className="label">To'liq ism</label>
                <input required className="input" placeholder="Ali Valiyev" value={form.name} onChange={set("name")} />
              </div>
              <div>
                <label className="label">Men kimman?</label>
                <div className="grid grid-cols-2 gap-2">
                  <RoleBtn active={form.role === "JOB_SEEKER"} onClick={() => setForm({ ...form, role: "JOB_SEEKER" })} icon="👤" label="Ish qidiruvchi" />
                  <RoleBtn active={form.role === "EMPLOYER"} onClick={() => setForm({ ...form, role: "EMPLOYER" })} icon="🏢" label="Ish beruvchi" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label">Email</label>
            <input required type="email" className="input" placeholder="siz@example.com" value={form.email} onChange={set("email")} />
          </div>
          <div>
            <label className="label">Parol</label>
            <input required type="password" minLength={6} className="input" placeholder="Kamida 6 belgi" value={form.password} onChange={set("password")} />
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{error}</p>}

          <button disabled={loading} className="btn-primary w-full !py-3">
            {loading ? "Yuklanmoqda..." : tab === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
          </button>
        </form>

        {/* Ajratgich */}
        <div className="my-6 flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> yoki <span className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Telegram widget joyi */}
        <div id="tg-login" className="flex justify-center [&>iframe]:!w-full" />

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
          Davom etish orqali siz JobUz shartlariga rozilik bildirasiz.
        </p>
      </div>
    </div>
  );
}

function RoleBtn({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 px-3 py-3 text-center transition ${
        active ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-200"
      }`}
    >
      <span className="block text-xl">{icon}</span>
      <span className={`mt-1 block text-xs font-semibold ${active ? "text-brand-700" : "text-slate-500"}`}>{label}</span>
    </button>
  );
}
