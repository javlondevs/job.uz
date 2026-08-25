// Umumiy konstantalar - viloyatlar, sohalar, enum'lar va tilga bog'liq yordamchilar
import { LOCALE_MAP } from "./i18n";

// Kanonik qiymatlar (backend'da saqlanadi) — har tilda ko'rsatiladigan nomlari
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

const REGION_LABELS = {
  "Toshkent": { ru: "Ташкент", en: "Tashkent" },
  "Toshkent viloyati": { ru: "Ташкентская область", en: "Tashkent Region" },
  "Samarqand": { ru: "Самарканд", en: "Samarkand" },
  "Buxoro": { ru: "Бухара", en: "Bukhara" },
  "Farg'ona": { ru: "Фергана", en: "Fergana" },
  "Andijon": { ru: "Андижан", en: "Andijan" },
  "Namangan": { ru: "Наманган", en: "Namangan" },
  "Qashqadaryo": { ru: "Кашкадарья", en: "Kashkadarya" },
  "Surxondaryo": { ru: "Сурхандарья", en: "Surkhandarya" },
  "Jizzax": { ru: "Джизак", en: "Jizzakh" },
  "Sirdaryo": { ru: "Сырдарья", en: "Syrdarya" },
  "Navoiy": { ru: "Навои", en: "Navoi" },
  "Xorazm": { ru: "Хорезм", en: "Khorezm" },
  "Qoraqalpog'iston": { ru: "Каракалпакстан", en: "Karakalpakstan" },
};

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
  "Huquq",
  "Davlat boshqaruvi",
  "Oziq-ovqat sanoati",
  "Neft va Gaz",
  "Energetika",
  "Agrar soha",
  "Mehmonxona va Restoran",
  "Sug'urta",
  "Inson resurslari",
  "Arxitektura va Dizayn",
  "Matbuot va Nashriyot",
  "Sport va Ommaviy hordiq",
  "Xavfsizlik",
  "Chakana savdo",
  "Ulgu savdo",
  "Telekommunikatsiya",
  "Farmatsevtika",
  "Kimyo sanoati",
  "Metallurgiya",
  "Maishiy xizmat",
  "Boshqa",
];

const SECTOR_LABELS = {
  "IT va Dasturlash": { ru: "IT и программирование", en: "IT & Programming" },
  "Moliya va Bank": { ru: "Финансы и банки", en: "Finance & Banking" },
  "Ta'lim": { ru: "Образование", en: "Education" },
  "Tibbiyot": { ru: "Медицина", en: "Healthcare" },
  "Marketing va Sotuv": { ru: "Маркетинг и продажи", en: "Marketing & Sales" },
  "Ishlab chiqarish": { ru: "Производство", en: "Manufacturing" },
  "Qurilish": { ru: "Строительство", en: "Construction" },
  "Transport va Logistika": { ru: "Транспорт и логистика", en: "Transport & Logistics" },
  "Xizmat ko'rsatish": { ru: "Услуги", en: "Services" },
  "Huquq": { ru: "Юриспруденция", en: "Legal" },
  "Davlat boshqaruvi": { ru: "Государственное управление", en: "Public Administration" },
  "Oziq-ovqat sanoati": { ru: "Пищевая промышленность", en: "Food Industry" },
  "Neft va Gaz": { ru: "Нефть и газ", en: "Oil & Gas" },
  "Energetika": { ru: "Энергетика", en: "Energy" },
  "Agrar soha": { ru: "Сельское хозяйство", en: "Agriculture" },
  "Mehmonxona va Restoran": { ru: "Гостиницы и рестораны", en: "Hospitality & Restaurants" },
  "Sug'urta": { ru: "Страхование", en: "Insurance" },
  "Inson resurslari": { ru: "Управление персоналом", en: "Human Resources" },
  "Arxitektura va Dizayn": { ru: "Архитектура и дизайн", en: "Architecture & Design" },
  "Matbuot va Nashriyot": { ru: "Пресса и издательство", en: "Media & Publishing" },
  "Sport va Ommaviy hordiq": { ru: "Спорт и отдых", en: "Sports & Recreation" },
  "Xavfsizlik": { ru: "Безопасность", en: "Security" },
  "Chakana savdo": { ru: "Розничная торговля", en: "Retail" },
  "Ulgu savdo": { ru: "Оптовая торговля", en: "Wholesale" },
  "Telekommunikatsiya": { ru: "Телекоммуникации", en: "Telecommunications" },
  "Farmatsevtika": { ru: "Фармацевтика", en: "Pharmaceuticals" },
  "Kimyo sanoati": { ru: "Химическая промышленность", en: "Chemical Industry" },
  "Metallurgiya": { ru: "Металлургия", en: "Metallurgy" },
  "Maishiy xizmat": { ru: "Бытовые услуги", en: "Domestic Services" },
  "Boshqa": { ru: "Другое", en: "Other" },
};

// Tilga mos yorliq (topilmasa asl qiymat qaytadi)
function labelFor(map, value, lang) {
  if (!value) return "";
  const item = map[value];
  if (!item) return value;
  return item[lang] || value;
}

export function regionLabel(value, lang) {
  return labelFor(REGION_LABELS, value, lang);
}

export function sectorLabel(value, lang) {
  return labelFor(SECTOR_LABELS, value, lang);
}

// Enum kalitlari (tarjima i18n'da: list.jobTypes.*, list.exp.*)
export const JOB_TYPE_KEYS = ["FULL_TIME", "PART_TIME", "REMOTE", "INTERNSHIP", "CONTRACT"];
export const EXPERIENCE_KEYS = ["NO_EXPERIENCE", "BEGINNER", "MID", "SENIOR"];
export const APPLICATION_STATUS_KEYS = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"];

// Sana formatlash: 12 avg 2025 / 12 авг 2025 / Aug 12, 2025
export function formatDate(d, lang = "uz") {
  try {
    return new Date(d).toLocaleDateString(LOCALE_MAP[lang] || "uz-UZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return new Date(d).toLocaleDateString();
  }
}

// Maosh matni (tilga mos)
export function salaryText(min, max, t) {
  const f = (n) => Number(n).toLocaleString("ru-RU").replace(/,/g, " ");
  const cur = t("list.currency");
  if (!min && !max) return t("list.salaryNegotiable");
  if (min && max) return `${f(min)} - ${f(max)} ${cur}`;
  if (min) return `${t("list.fromSuffix")} ${f(min)} ${cur}`;
  return `${t("list.toSuffix")} ${f(max)} ${cur}`;
}

// "2 soat oldin" ko'rinishidagi vaqt
export function timeAgo(date, t) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return t("list.now");
  const m = Math.floor(s / 60);
  if (m < 60) return t("list.minAgo", { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t("list.hourAgo", { n: h });
  const d = Math.floor(h / 24);
  if (d < 30) return t("list.dayAgo", { n: d });
  return formatDate(date);
}
