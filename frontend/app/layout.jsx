// Root layout - Inter + Sora shriftlari, Navbar/Footer, til + tema sinxroni
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata = {
  title: {
    default: "JOBUZ — O'zbekistonda ish toping",
    template: "%s | JOBUZ",
  },
  description:
    "O'zbekiston bo'ylab vakansiyalar, CV builder va Telegram bildirishnomalari. Ish beruvchilar uchun qulay panel.",
};

// Dark rejim miltillashtirilishining oldini oluvchi inline skript (React'gacha)
const themeScript = `
(function(){
  try {
    var saved = localStorage.getItem("jobuz-theme");
    var dark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    var lang = localStorage.getItem("jobuz-lang");
    if (lang === "ru" || lang === "en") document.documentElement.lang = lang;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
