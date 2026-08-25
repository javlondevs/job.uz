// Auth store - Zustand bilan localStorage'da saqlanadi
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";
import { translate } from "./i18n";

function initialLang() {
  if (typeof window === "undefined") return "uz";
  const saved = localStorage.getItem("jobuz-lang");
  return saved === "ru" || saved === "en" ? saved : "uz";
}

function initialTheme() {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("jobuz-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Til va tema (kunduzgi/tungi rejim) sozlamalari
export const usePrefs = create((set, get) => ({
  lang: "uz",
  theme: "light",
  mounted: false,

  // Klientda localStorage'dan o'qish (SSR mosligi uchun)
  init: () => {
    if (get().mounted) return;
    set({ lang: initialLang(), theme: initialTheme(), mounted: true });
  },

  setLang: (lang) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jobuz-lang", lang);
      document.documentElement.lang = lang;
    }
    set({ lang });
  },

  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),

  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jobuz-theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    set({ theme });
  },
}));

export function useT() {
  const lang = usePrefs((s) => s.lang);
  return (path, vars) => translate(lang, path, vars);
}

export const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      // Login/register muvaffaqiyatli bo'lganda
      setSession: ({ token, user }) => {
        localStorage.setItem("jobuz_token", token);
        set({ token, user });
      },

      logout: () => {
        localStorage.removeItem("jobuz_token");
        set({ user: null, token: null });
      },

      // Sahifa yangilanganda profil yangilab turamiz
      refreshMe: async () => {
        if (!get().token) return;
        try {
          const { data } = await api.get("/api/auth/me");
          // Backend rol o'zgarsa yangi token ham qaytaradi
          if (data.token) localStorage.setItem("jobuz_token", data.token);
          set({ user: data, token: data.token || get().token });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "jobuz-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
