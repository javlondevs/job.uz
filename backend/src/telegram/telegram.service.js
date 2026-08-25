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

// 4) Bot update'larini qayta ishlash (webhook ham, polling ham shundan foydalanadi)
async function handleUpdate(update) {
  const msg = update.message;
  if (!msg?.text) return;

  const chatId = String(msg.chat.id);
  const text = msg.text.trim();

  if (text.startsWith("/start")) {
    await sendMessage(chatId, [
      `👋 Assalomu alaykum, <b>${msg.chat.first_name ?? ""}</b>!`,
      ``,
      `Bu <b>JobUz</b> boti — O'zbekiston ish qidirish platformasi.`,
      ``,
      `📌 <b>Buyruqlar:</b>`,
      `/help — Yordam`,
      `/search <b>Kasb nomi</b> — Vakansiyalarni qidirish`,
      `/locations — Viloyatlar ro'yxati`,
      `/sectors — Kasb sohalari ro'yxati`,
      `/latest — So'nggi vakansiyalar`,
      `/subscribe — Telegram bildirishnomani yoqish`,
      `/myapps — Mening arizalarim`,
      `/cabinet — Shaxsiy kabinet (saytga kirish)`,
      ``,
      `🔗 Sayt: ${process.env.FRONTEND_URL}`,
    ].join("\n"));
    return;
  }

  if (text.startsWith("/help")) {
    await sendMessage(chatId, [
      `📖 <b>JobUz boti — Yordam</b>`,
      ``,
      `🔍 /search <i>Dasturchi</i> — Kasb bo'yicha vakansiyalarni toping`,
      `📍 /locations — O'zbekiston viloyatlari ro'yxati`,
      `🏢 /sectors — Barcha kasb sohalari`,
      `🆕 /latest — Oxirgi qo'shilgan vakansiyalar`,
      `🔔 /subscribe — Yangi vakansiyalar haqida xabar oling`,
      `📋 /myapps — Arizalaringiz holatini tekshiring`,
      `🌐 /cabinet — Saytdagi shaxsiy kabinetga kiring`,
      ``,
      `Masalan: <code>/search Oshpaz Toshkent</code> — Toshkentdagi oshpazlik vakansiyalari`,
    ].join("\n"));
    return;
  }

  if (text.startsWith("/locations")) {
    const regions = [
      "Toshkent", "Toshkent viloyati", "Samarqand", "Buxoro",
      "Farg'ona", "Andijon", "Namangan", "Qashqadaryo",
      "Surxondaryo", "Jizzax", "Sirdaryo", "Navoiy",
      "Xorazm", "Qoraqalpog'iston",
    ];
    await sendMessage(chatId, [
      `📍 <b>Viloyatlar ro'yxati:</b>`,
      ``,
      ...regions.map((r, i) => `${i + 1}. ${r}`),
      ``,
      `Qidirish: <code>/search Kasb nomi Viloyat</code>`,
    ].join("\n"));
    return;
  }

  if (text.startsWith("/sectors")) {
    const sectors = [
      "IT va Dasturlash", "Moliya va Bank", "Ta'lim", "Tibbiyot",
      "Marketing va Sotuv", "Ishlab chiqarish", "Qurilish",
      "Transport va Logistika", "Xizmat ko'rsatish", "Huquq",
      "Davlat boshqaruvi", "Oziq-ovqat sanoati", "Neft va Gaz",
      "Energetika", "Agrar soha", "Mehmonxona va Restoran",
      "Sug'urta", "Inson resurslari", "Arxitektura va Dizayn",
      "Telekommunikatsiya", "Farmatsevtika", "Chakana savdo",
      "Xavfsizlik", "Sport va Ommaviy hordiq",
    ];
    await sendMessage(chatId, [
      `🏢 <b>Kasb sohalari ro'yxati:</b>`,
      ``,
      ...sectors.map((s) => `• ${s}`),
      ``,
      `Qidirish: <code>/search Kasb nomi</code>`,
    ].join("\n"));
    return;
  }

  if (text.startsWith("/latest")) {
    try {
      const jobs = await prisma.job.findMany({
        where: { status: "OPEN" },
        include: { company: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      if (jobs.length === 0) {
        await sendMessage(chatId, "📭 Hozircha ochiq vakansiyalar yo'q.");
        return;
      }
      const lines = [`🆕 <b>So'nggi vakansiyalar:</b>`, ``];
      for (const j of jobs) {
        lines.push(jobMessage(j));
        lines.push(`🔗 <a href="${process.env.FRONTEND_URL}/jobs/${j.id}">Batafsil</a>`);
        lines.push(`---`);
      }
      await sendMessage(chatId, lines.join("\n"));
    } catch {
      await sendMessage(chatId, "Xatolik yuz berdi.");
    }
    return;
  }

  if (text.startsWith("/cabinet")) {
    await sendMessage(chatId, [
      `🌐 <b>Shaxsiy kabinet</b>`,
      ``,
      `Saytda tizimga kirib, barcha imkoniyatlardan foydalaning:`,
      `• Arizalar holatini kuzating`,
      `• CV yarating`,
      `• Vakansiyalar qo'shing (ish beruvchi)`,
      ``,
      `🔗 <a href="${process.env.FRONTEND_URL}/login">Kirish</a>`,
      `🔗 <a href="${process.env.FRONTEND_URL}/register">Ro'yxatdan o'tish</a>`,
    ].join("\n"));
    return;
  }

  if (text.startsWith("/myapps")) {
    const telegramId = String(msg.from?.id || chatId);
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      await sendMessage(chatId, [
        `⚠️ Siz hali tizimga kirgan emassiz.`,
        ``,
        `Saytga kirib, Telegram ID'ingizni bog'lang:`,
        `🔗 <a href="${process.env.FRONTEND_URL}/dashboard">Dashboard</a>`,
      ].join("\n"));
      return;
    }
    const apps = await prisma.application.findMany({
      where: { userId: user.id },
      include: { job: { include: { company: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    if (apps.length === 0) {
      await sendMessage(chatId, "📭 Sizda hali arizalar yo'q.");
      return;
    }
    const statusEmoji = { PENDING: "⏳", REVIEWED: "👀", ACCEPTED: "✅", REJECTED: "❌" };
    const lines = [`📋 <b>Mening arizalarim (${apps.length} ta):</b>`, ``];
    for (const a of apps) {
      lines.push(`${statusEmoji[a.status] || "•"} <b>${a.job.title}</b> — ${a.job.company?.name || "?"}`);
      lines.push(`   Holat: ${a.status}`);
      lines.push(``);
    }
    await sendMessage(chatId, lines.join("\n"));
    return;
  }

  if (text.startsWith("/subscribe")) {
    await sendMessage(chatId, [
      `🔔 <b>Telegram bildirishnomalar</b>`,
      ``,
      `Vakansiyalar haqida avtomatik xabar olish uchun:`,
      `1. Saytga kiring: <a href="${process.env.FRONTEND_URL}/login">Kirish</a>`,
      `2. Dashboard'da "Telegram bildirishnomalar" bo'limiga kiring`,
      `3. Telegram ID'ingizni kiriting va obuna yarating`,
      `4. Filtrlaringizni saqlang — mos vakansiyalar botga tushadi!`,
    ].join("\n"));
    return;
  }

  if (text.startsWith("/search")) {
    const query = text.replace("/search", "").trim();
    if (!query) {
      await sendMessage(chatId, "Foydalanish: <code>/search Kasb nomi</code>\nMasalan: <code>/search Dasturchi</code>");
      return;
    }
    try {
      const jobs = await prisma.job.findMany({
        where: {
          status: "OPEN",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { company: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      if (jobs.length === 0) {
        await sendMessage(chatId, `❌ "<b>${query}</b>" bo'yicha hech narsa topilmadi.`);
        return;
      }
      const lines = [`🔍 "<b>${query}</b>" bo'yicha ${jobs.length} ta natija:`, ``];
      for (const j of jobs) {
        lines.push(jobMessage(j));
        lines.push(`🔗 <a href="${process.env.FRONTEND_URL}/jobs/${j.id}">Batafsil</a>`);
        lines.push(`---`);
      }
      await sendMessage(chatId, lines.join("\n"));
    } catch {
      await sendMessage(chatId, "Xatolik yuz berdi.");
    }
    return;
  }

  // Noma'lum buyruq
  await sendMessage(chatId, "❓ Buyruq topilmadi. /help yozib yordam oling.");
}

module.exports = { sendMessage, notifyNewJob, postJobToChannel, verifyLoginWidget, telegramEnabled, handleUpdate };
