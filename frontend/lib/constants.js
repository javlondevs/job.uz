// Umumiy konstantalar - viloyatlar, sohalar, enum tarjimalari

export const REGIONS = [
  "Toshkent",
  "Toshkent viloyati",
  "Samarqand",
  "Buxoro",
  "Farg'ona",
  "Andijon",
  "Namangan",
  "Qashqadaryo",
  "Surxondaryo",
  "Jizzax",
  "Sirdaryo",
  "Navoiy",
  "Xorazm",
  "Qoraqalpog'iston",
];

export const SECTORS = [
  "IT va Dasturlash",
  "Moliya va Bank",
  "Ta'lim",
  "Tibbiyot",
  "Marketing va Sotuv",
  "Ishlab chiqarish",
  "Qurilish",
  "Transport va Logistika",
  "Xizmat ko'rsatish",
  "Boshqa",
];

export const JOB_TYPES = {
  FULL_TIME: "To'liq stavka",
  PART_TIME: "Yarim stavka",
  REMOTE: "Masofaviy",
  INTERNSHIP: "Amaliyot",
  CONTRACT: "Shartnoma asosida",
};

export const EXPERIENCE_LEVELS = {
  NO_EXPERIENCE: "Tajriba shart emas",
  BEGINNER: "1-2 yil",
  MID: "3-5 yil",
  SENIOR: "5+ yil",
};

export const APPLICATION_STATUS = {
  PENDING: { label: "Ko'rilmagan", cls: "bg-slate-100 text-slate-600" },
  REVIEWED: { label: "Ko'rilgan", cls: "bg-blue-50 text-blue-600" },
  ACCEPTED: { label: "Qabul qilindi", cls: "bg-emerald-50 text-emerald-600" },
  REJECTED: { label: "Rad etildi", cls: "bg-rose-50 text-rose-600" },
};

// Sana formatlash: 12 avg, 2025
export function formatDate(d) {
  return new Date(d).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" });
}

// Maosh matni
export function salaryText(min, max) {
  if (!min && !max) return "Maosh kelishilgan holda";
  const f = (n) => Number(n).toLocaleString("ru-RU").replace(/,/g, " ");
  if (min && max) return `${f(min)} - ${f(max)} so'm`;
  if (min) return `${f(min)} so'mdan`;
  return `${f(max)} so'mgacha`;
}

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "hozir";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} kun oldin`;
  return formatDate(date);
}
