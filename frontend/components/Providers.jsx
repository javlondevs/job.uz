"use client";

// Providers - til va temani <html> ga sinxronlaydi (dark klass + lang atributi)
import { useEffect } from "react";
import { usePrefs } from "@/lib/store";

export default function Providers({ children }) {
  const init = usePrefs((s) => s.init);
  const lang = usePrefs((s) => s.lang);
  const theme = usePrefs((s) => s.theme);

  // Birinchi renderdan keyin localStorage'dan sozlamalarni o'qiydi.
  // Dark rejimdagi "miltillash"ni layout'dagi inline skript oldini oladi.
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return children;
}
