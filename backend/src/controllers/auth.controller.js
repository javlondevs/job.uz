// Auth controller - ro'yxatdan o'tish, kirish, profil
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "jobuz-dev-secret";

// JWT token yaratish
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Ism, email va parol majburiy" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Parol kamida 6 belgidan iborat bo'lsin" });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(409).json({ message: "Bu email allaqachon ro'yxatdan o'tgan" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role === "EMPLOYER" ? "EMPLOYER" : "JOB_SEEKER",
    },
  });

  res.status(201).json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email va parol kerak" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Email yoki parol xato" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Email yoki parol xato" });

  res.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

// GET /api/auth/me - joriy foydalanuvchi (kompaniya bilan birga)
async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { company: true },
  });
  if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

  const { passwordHash, ...safe } = user;

  // Rol o'zgargan bo'lishi mumkin (admin tomonidan) - yangi token beramiz
  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET || "jobuz-dev-secret",
    { expiresIn: "7d" }
  );

  res.json({ ...safe, token });
}

module.exports = { register, login, me };
