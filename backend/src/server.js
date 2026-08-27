// JobUz backend - asosiy server fayli
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/job.routes");
const companyRoutes = require("./routes/company.routes");
const cvRoutes = require("./routes/cv.routes");
const applicationRoutes = require("./routes/application.routes");
const telegramRoutes = require("./routes/telegram.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// CORS - faqat frontend domenga ruxsat (env orqali sozlanadi)
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman/curl kabi origin'siz so'rovlarga ham ruxsat beramiz
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS bloklandi: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" })); // CV rasmlari uchun kattaroq limit
app.use(morgan("dev"));

// Yuklangan fayllar (logotiplar) statik tarzda beriladi
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API marshrutlari
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/admin", adminRoutes);

// Salomatlik tekshiruvi (Render uchun)
app.get("/health", (req, res) => res.json({ ok: true, service: "jobuz-api" }));

// Vaqtinchalik: barcha parollarni tiklash (bir marta ishlatiladi)
app.post("/health/seed-passwords", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const { prisma } = require("./config/db");
    const accounts = [
      { email: "admin@jobuz.uz", password: "admin123", role: "ADMIN" },
      { email: "employer@jobuz.uz", password: "employer123", role: "EMPLOYER" },
      { email: "seeker@jobuz.uz", password: "seeker123", role: "JOB_SEEKER" },
    ];
    const results = [];
    for (const a of accounts) {
      const hash = await bcrypt.hash(a.password, 10);
      const user = await prisma.user.update({ where: { email: a.email }, data: { passwordHash: hash } });
      results.push(`${a.email} -> ${a.password} (role: ${user.role})`);
    }
    res.json({ ok: true, results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 404
app.use((req, res) => res.status(404).json({ message: "Topilmadi" }));

// Markaziy xato boshqaruvi
app.use((err, req, res, next) => {
  console.error("XATO:", err.message);
  if (err.message === "CORS bloklandi: " + req.headers.origin) {
    return res.status(403).json({ message: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Fayl hajmi juda katta (max 10MB)" });
  }
  res.status(err.status || 500).json({ message: err.message || "Server xatosi" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ JobUz API ishlayapti: http://localhost:${PORT}`);

  // Lokal rejimda bot uchun long-polling (webhook faqat public URL'da ishlaydi)
  if (process.env.TELEGRAM_POLLING === "true" && process.env.TELEGRAM_BOT_TOKEN) {
    const { startPolling } = require("./telegram/polling");
    startPolling();
  }
});
