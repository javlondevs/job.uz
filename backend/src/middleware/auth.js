// JWT autentifikatsiya middleware'lari
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "jobuz-dev-secret";

// Foydalanuvchi tokenidan ma'lumotini olish (majburiy emas)
function attachUser(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET);
    } catch (_) {
      // token noto'g'ri bo'lsa ham so'rovni davom ettiramiz
    }
  }
  next();
}

// Login qilgan foydalanuvchini tekshirish (majburiy)
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Avval tizimga kiring" });
  }
  next();
}

// Faqat ish beruvchi uchun
function requireEmployer(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Avval tizimga kiring" });
  if (req.user.role !== "EMPLOYER") {
    return res.status(403).json({ message: "Bu amal faqat ish beruvchilar uchun" });
  }
  next();
}

module.exports = { attachUser, requireAuth, requireEmployer, JWT_SECRET };
