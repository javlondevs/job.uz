// Auth store - Zustand bilan localStorage'da saqlanadi
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";

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
          set({ user: data });
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
