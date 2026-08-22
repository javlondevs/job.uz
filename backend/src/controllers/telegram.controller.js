// Telegram controller - webhook va obuna
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const { verifyLoginWidget, sendMessage, telegramEnabled } = require("../telegram/telegram.service");

// POST /api/telegram/webhook - botdan kelgan update'lar
async function webhook(req, res) {
  const update = req.body || {};
  res.json({ ok: true }); // Telegram'ga darhol javob beramiz

  try {
    const msg = update.message;
    if (!msg?.text) return;

    const chatId = String(msg.chat.id);
    const text = msg.text.trim();

    // /start komandasi - foydalanuvchini kutish
    if (text.startsWith("/start")) {
      await sendMessage(
        chatId,
        [
          `👋 Assalomu alaykum, <b>${msg.chat.first_name ?? ""}</b>!`,
          ``,
          `Bu <b>JobUz</b> boti. Saytda o'z filtrlaringizni saqlab, Telegram bildirishnomasini yoqsaingiz,`,
          `mos yangi vakansiyalar shu yerga tushadi.`,
          ``,
          `🔗 Sayt: ${process.env.FRONTEND_URL}`,
        ].join("\n")
      );
    }
  } catch (e) {
    console.error("Webhook xatosi:", e.message);
  }
}

// POST /api/telegram/login - Login Widget ma'lumotlari bilan kirish/ro'yxatdan o'tish
async function telegramLogin(req, res) {
  const authData = req.body;
  if (!telegramEnabled()) return res.status(501).json({ message: "Telegram sozlanmagan" });

  if (!verifyLoginWidget(authData)) {
    return res.status(401).json({ message: "Imzo noto'g'ri (fake data?)" });
  }

  // Widget 24 soat ichidagi ma'lumot yuborishi kerak
  if (Date.now() / 1000 - Number(authData.auth_date) > 86400) {
    return res.status(401).json({ message: "Ma'lumot eskirgan" });
  }

  let user = await prisma.user.findUnique({ where: { telegramId: String(authData.id) } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: [authData.first_name, authData.last_name].filter(Boolean).join(" ") || authData.username,
        email: `${authData.username || authData.id}@tg.jobuz.uz`, // unikal email generatsiya
        role: "JOB_SEEKER",
        telegramId: String(authData.id),
        telegramUsername: authData.username,
      },
    });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET || "jobuz-dev-secret",
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

// POST /api/telegram/subscribe - filtr bo'yicha obuna
async function subscribe(req, res) {
  const { name, filters, telegramNotify, telegramId } = req.body;

  // Telegram ID hali yo'q bo'lsa saqlaymiz (foydalanuvchi botga /start bosganda ham keladi)
  if (telegramId && !req.user.telegramId) {
    await prisma.user.update({ where: { id: req.user.id }, data: { telegramId: String(telegramId) } });
  }

  const saved = await prisma.savedFilter.upsert({
    where: { id: req.body.id || "" },
    create: {
      userId: req.user.id,
      name: name || "Filtrim",
      filters: filters || {},
      telegramNotify: telegramNotify !== false,
    },
    update: { name, filters, telegramNotify },
  });

  res.json(saved);
}

// GET /api/telegram/subscriptions - obunalarim
async function mySubscriptions(req, res) {
  const subs = await prisma.savedFilter.findMany({ where: { userId: req.user.id } });
  res.json(subs);
}

// DELETE /api/telegram/subscribe/:id
async function unsubscribe(req, res) {
  const sub = await prisma.savedFilter.findUnique({ where: { id: req.params.id } });
  if (!sub || sub.userId !== req.user.id) return res.status(404).json({ message: "Obuna topilmadi" });
  await prisma.savedFilter.delete({ where: { id: sub.id } });
  res.json({ ok: true });
}

module.exports = { webhook, telegramLogin, subscribe, mySubscriptions, unsubscribe };
