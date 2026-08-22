// Telegram xizmati - Bot API bilan axios orqali ishlash
// (node-telegram-bot-api o'rniga yengil yechim - webhook rejimi uchun qulay)
const axios = require("axios");
const { prisma } = require("../config/db");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // masalan: @jobuz_kanali

const api = axios.create({
  baseURL: `https://api.telegram.org/bot${BOT_TOKEN}`,
  timeout: 10000,
});

// Token bormi? (yo'qsa hech narsa yubormaymiz, ilova ishlashda davom etadi)
function telegramEnabled() {
  return Boolean(BOT_TOKEN);
}

// Xabar yuborish (umumiy funksiya)
async function sendMessage(chatId, text, options = {}) {
  if (!telegramEnabled()) return null;
  try {
    const { data } = await api.post("/sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
      ...options,
    });
    return data.result;
  } catch (e) {
    console.error("Telegram sendMessage xatosi:", e.response?.data?.description || e.message);
    return null;
  }
}

// Vakansiya uchun chiroyli xabar matni
function jobMessage(job) {
  const salary =
    job.salaryMin || job.salaryMax
      ? `\n💰 Maosh: ${job.salaryMin?.toLocaleString("ru-RU") ?? "?"} - ${job.salaryMax?.toLocaleString("ru-RU") ?? "?"} so'm`
      : "";
  const typeMap = {
    FULL_TIME: "To'liq stavka",
    PART_TIME: "Yarim stavka",
    REMOTE: "Masofaviy",
    INTERNSHIP: "Amaliyot",
    CONTRACT: "Shartnoma",
  };
  return [
    `🔔 <b>Yangi vakansiya!</b>`,
    ``,
    `<b>${job.title}</b>`,
    `🏢 ${job.company?.name ?? "Kompaniya"}`,
    `📍 ${job.isRemote ? "Masofaviy" : job.location ?? "Ko'rsatilmagan"}${salary}`,
    `⏰ ${typeMap[job.type] ?? job.type}`,
    ``,
    `${(job.description || "").slice(0, 300)}${(job.description || "").length > 300 ? "..." : ""}`,
  ].join("\n");
}

// 1) Filtrlarga mos obunachilarga bildirishnoma yuborish
async function notifyNewJob(job) {
  if (!telegramEnabled()) return;

  // Barcha aktiv obunalarni olamiz
  const subs = await prisma.savedFilter.findMany({
    where: { telegramNotify: true },
    include: { user: true },
  });

  for (const sub of subs) {
    const f = sub.filters || {};
    let match = true;

    if (f.q && !(`${job.title} ${job.description}`.toLowerCase().includes(String(f.q).toLowerCase()))) match = false;
    if (f.location && !(job.location || "").toLowerCase().includes(String(f.location).toLowerCase())) match = false;
    if (f.type && f.type !== job.type && f.type !== "ALL") match = false;
    if (f.isRemote && !job.isRemote) match = false;
    if (f.salaryMin && job.salaryMax && job.salaryMax < Number(f.salaryMin)) match = false;

    if (match && sub.user.telegramId) {
      await sendMessage(sub.user.telegramId, jobMessage(job));
    }
  }
}

// 2) Kanalga avtomatik post
async function postJobToChannel(job) {
  if (!telegramEnabled() || !CHANNEL_ID) return null;
  const msg = await sendMessage(CHANNEL_ID, jobMessage(job), {
    reply_markup: {
      inline_keyboard: [[{ text: "🔎 Batafsil ko'rish", url: `${process.env.FRONTEND_URL}/jobs/${job.id}` }]],
    },
  });
  // Xabar ID sini saqlaymiz (vakansiya o'chsa postni ham o'chirish mumkin)
  if (msg?.message_id) {
    await prisma.job.update({ where: { id: job.id }, data: { telegramMessageId: String(msg.message_id) } });
  }
  return msg;
}

// 3) Telegram Login Widget imzosini tekshirish
const crypto = require("crypto");
function verifyLoginWidget(authData) {
  const { hash, ...rest } = authData;
  const secret = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");
  const hmac = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
  return hmac === hash;
}

module.exports = { sendMessage, notifyNewJob, postJobToChannel, verifyLoginWidget, telegramEnabled };
