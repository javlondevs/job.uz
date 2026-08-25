"use client";

// Kirish / Ro'yxatdan o'tish + Telegram orqali kirish
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth, useT } from "@/lib/store";

export default function LoginPage() {
  const t = useT();
  return (
    <Suspense fallback={<div className="py-32 text-center text-slate-400 dark:text-slate-500">{t("common.loading")}</div>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const params = useSearchParams();
  const router = useRouter();
  const t = useT();
  const { setSession, user } = useAuth();
  const [tab, setTab] = useState(params.get("tab") === "register" ? "register" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: params.get("role") === "employer" ? "EMPLOYER" : "JOB_SEEKER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocal, setIsLocal] = useState(false);

  // Lokal rejimda Telegram widget "Bot domain invalid" xatosini beradi -
  // chunki Telegram localhost domenini tasdiqlamaydi. Shuning uchun yashiramiz.
  useEffect(() => {
    const host = window.location.hostname;
    setIsLocal(host === "localhost" || host === "127.0.0.1");
  }, []);

  // Allaqachon kirgan bo'lsa dashboard'ga
  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  // Telegram Login Widget skriptini yuklash (faqat public domenda)
  useEffect(() => {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return;

    window.onTelegramAuth = async (tgUser) => {
      setError("");
      try {
        const { data } = await api.post("/api/telegram/login", tgUser);
        setSession(data);
        router.push("/dashboard");
      } catch (e) {
        setError(e.response?.data?.message || t("auth.tgFailed"));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError(e.response?.data?.message || t("common.error"));
    }
    setLoading(false);
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {tab === "login" ? t("auth.welcome") : t("auth.joinTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {tab === "login" ? t("auth.loginSub") : t("auth.registerSub")}
          </p>
        </div>

        {/* Tab tugmalari */}
        <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setTab("login")}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${tab === "login" ? "bg-white shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
          >
            {t("auth.login")}
          </button>
          <button
            onClick={() => setTab("register")}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${tab === "register" ? "bg-white shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
          >
            {t("auth.register")}
          </button>
        </div>

        {/* Forma */}
        <form onSubmit={submit} className="card mt-4 space-y-4 p-6">
          {tab === "register" && (
            <>
              <div>
                <label className="label">{t("auth.fullName")}</label>
                <input required className="input" placeholder={t("auth.fullNamePh")} value={form.name} onChange={set("name")} />
              </div>
              <div>
                <label className="label">{t("auth.whoAreYou")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <RoleBtn active={form.role === "JOB_SEEKER"} onClick={() => setForm({ ...form, role: "JOB_SEEKER" })} icon="👤" label={t("auth.seeker")} />
                  <RoleBtn active={form.role === "EMPLOYER"} onClick={() => setForm({ ...form, role: "EMPLOYER" })} icon="🏢" label={t("auth.employer")} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label">{t("auth.email")}</label>
            <input required type="email" className="input" placeholder="siz@example.com" value={form.email} onChange={set("email")} />
          </div>
          <div>
            <label className="label">{t("auth.password")}</label>
            <input required type="password" minLength={6} className="input" placeholder={t("auth.passwordPh")} value={form.password} onChange={set("password")} />
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}

          <button disabled={loading} className="btn-primary w-full !py-3">
            {loading ? t("common.loading") : tab === "login" ? t("auth.login") : t("auth.register")}
          </button>
        </form>

        {/* Ajratgich */}
        <div className="my-6 flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /> {t("auth.or")} <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Telegram widget joyi (lokalda yashiriladi) */}
        {isLocal ? (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-xs leading-relaxed text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {t("auth.tgLocalNote")}
          </p>
        ) : (
          <div id="tg-login" className="flex justify-center [&>iframe]:!w-full" />
        )}

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
          {t("auth.terms")}
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
        active
          ? "border-brand-500 bg-brand-50 dark:border-gold-500 dark:bg-gold-500/10"
          : "border-slate-200 hover:border-brand-200 dark:border-slate-700 dark:hover:border-slate-500"
      }`}
    >
      <span className="block text-xl">{icon}</span>
      <span className={`mt-1 block text-xs font-semibold ${active ? "text-brand-700 dark:text-gold-300" : "text-slate-500 dark:text-slate-400"}`}>{label}</span>
    </button>
  );
}
