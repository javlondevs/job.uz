// Admin controller - foydalanuvchilar, vakansiyalar va statistika boshqaruvi
const { prisma } = require("../config/db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-test";

// GET /api/admin/stats - umumiy statistika
async function stats(req, res) {
  const [users, seekers, employers, admins, companies, jobs, openJobs, applications] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "JOB_SEEKER" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.company.count(),
    prisma.job.count(),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.application.count(),
  ]);
  res.json({
    users,
    roles: { JOB_SEEKER: seekers, EMPLOYER: employers, ADMIN: admins },
    companies,
    jobs,
    openJobs,
    applications,
  });
}

// GET /api/admin/users?q=&role=&page= - foydalanuvchilar ro'yxati
async function listUsers(req, res) {
  const q = req.query.q || "";
  const role = req.query.role || "";
  const page = Math.max(1, Number(req.query.page) || 1);
  const take = 20;

  const where = {};
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }];
  if (["JOB_SEEKER", "EMPLOYER", "ADMIN"].includes(role)) where.role = role;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        telegramId: true, createdAt: true,
        _count: { select: { applications: true, cvs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ data, meta: { page, totalPages: Math.ceil(total / take), total } });
}

// PUT /api/admin/users/:id/role - rol o'zgartirish
async function changeRole(req, res) {
  const { role } = req.body;
  if (!["JOB_SEEKER", "EMPLOYER", "ADMIN"].includes(role)) {
    return res.status(400).json({ message: "Rol noto'g'ri" });
  }
  if (req.params.id === req.user.id && role !== "ADMIN") {
    return res.status(400).json({ message: "O'zingizga adminlikni ola olmaysiz" });
  }
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch {
    res.status(404).json({ message: "Foydalanuvchi topilmadi" });
  }
}

// DELETE /api/admin/users/:id - foydalanuvchini o'chirish (o'zini o'chira olmaydi)
async function deleteUser(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "O'zingizni o'chira olmaysiz" });
  }
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ message: "Foydalanuvchi topilmadi" });
  }
}

// GET /api/admin/jobs?q=&page= - barcha vakansiyalar
async function listJobs(req, res) {
  const q = req.query.q || "";
  const page = Math.max(1, Number(req.query.page) || 1);
  const take = 20;

  const where = q ? { title: { contains: q, mode: "insensitive" } } : {};

  const [data, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: { select: { name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.job.count({ where }),
  ]);

  res.json({ data, meta: { page, totalPages: Math.ceil(total / take), total } });
}

// PUT /api/admin/jobs/:id/status - vakansiya holati (OPEN/CLOSED)
async function changeJobStatus(req, res) {
  const status = req.body.status === "CLOSED" ? "CLOSED" : "OPEN";
  try {
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: { status },
      select: { id: true, title: true, status: true },
    });
    res.json(job);
  } catch {
    res.status(404).json({ message: "Vakansiya topilmadi" });
  }
}

// DELETE /api/admin/jobs/:id - vakansiyani o'chirish
async function deleteJob(req, res) {
  try {
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ message: "Vakansiya topilmadi" });
  }
}

// POST /api/admin/users/:id/impersonate - foydalanuvchi sifatida kirish
async function impersonateUser(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "O'zingizga o'tib bo'lmaydi" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, phone: true, telegramId: true, company: true },
    });
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, user });
  } catch {
    res.status(500).json({ message: "Xatolik yuz berdi" });
  }
}

// GET /api/admin/companies - barcha kompaniyalar
async function listCompanies(req, res) {
  const q = req.query.q || "";
  const page = Math.max(1, Number(req.query.page) || 1);
  const take = 20;

  const where = q ? { name: { contains: q, mode: "insensitive" } } : {};

  const [data, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.company.count({ where }),
  ]);

  res.json({ data, meta: { page, totalPages: Math.ceil(total / take), total } });
}

module.exports = { stats, listUsers, changeRole, deleteUser, listJobs, changeJobStatus, deleteJob, impersonateUser, listCompanies };
