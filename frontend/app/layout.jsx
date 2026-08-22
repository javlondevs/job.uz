// Root layout - Inter + Sora shriftlari, Navbar/Footer
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata = {
  title: {
    default: "JobUz — O'zbekistonda ish toping",
    template: "%s | JobUz",
  },
  description:
    "O'zbekiston bo'ylab vakansiyalar, CV builder va Telegram bildirishnomalari. Ish beruvchilar uchun qulay panel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
