// API client - axios instance, token avtomatik qo'shiladi
import axios from "axios";

// Server-side (SSR) uchun ichki manzil tezroq va ishonchli,
// brauzer uchun public URL kerak
const isServer = typeof window === "undefined";
const baseURL = isServer
  ? process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL,
  timeout: 30000, // osilgan so'rovlar 30s dan keyin uziladi
});

// Har bir so'rovga token qo'shamiz
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("jobuz_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
