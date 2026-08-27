// Job controller - vakansiyalar CRUD va qidiruv
const { prisma } = require("../config/db");
const { notifyNewJob, postJobToChannel } = require("../telegram/telegram.service");

// Qidiruv filtrlarini Prisma "where" shartiga aylantirish
function buildWhere(query) {
  const where = { status: "OPEN" };

  // Kalit so'z: sarlavha yoki tavsifda qidirish
  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { company: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }
  if (query.location) where.location = { contains: query.location, mode: "insensitive" };
  if (query.type) where.type = query.type;
  if (query.experience) where.experience = query.experience;
  if (query.companyId) where.companyId = query.companyId;
  // Soha bo'yicha qidirish - kompaniyaning sektori orqali (qisman moslik)
  if (query.sector) {
    where.company = { ...where.company, sector: { contains: query.sector, mode: "insensitive" } };
  }
  if (query.isRemote === "true") {
    where.isRemote = true;
  }

  // Maosh oralig'i: vakansiya oralig'i foydalanuvchi tanlagan oralig' bilan kesishadi
  const min = parseInt(query.salaryMin);
  const max = parseInt(query.salaryMax);
  if (!isNaN(min) || !isNaN(max)) {
    where.AND = [];
    if (!isNaN(min)) where.AND.push({ salaryMax: { gte: min } });
    if (!isNaN(max)) where.AND.push({ salaryMin: { lte: max } });
  }

  return where;
}

// GET /api/jobs - filtrlar, saralash, sahifalash
async function listJobs(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  // Saralash: yangi | maosh bo'yicha pasayish
  let orderBy = { createdAt: "desc" };
  if (req.query.sort === "salary") orderBy = [{ salaryMax: "desc" }, { createdAt: "desc" }];

  const where = buildWhere(req.query);

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { company: { select: { id: true, name: true, logoUrl: true, sector: true, location: true } } },
    }),
  ]);

  res.json({
    data: jobs,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// GET /api/jobs/my - ish beruvchining o'z vakansiyalari
async function myJobs(req, res) {
  const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
  if (!company) return res.json([]);

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
  res.json(jobs);
}

// GET /api/jobs/:id
async function getJob(req, res) {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  });
  if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
  res.json(job);
}

// POST /api/jobs - faqat employer; yangi vakansiya kanalga ham tushadi
async function createJob(req, res) {
  const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
  if (!company) {
    return res.status(400).json({ message: "Avval kompaniya profilini yarating" });
  }

  const { title, description, salaryMin, salaryMax, type, experience, location, isRemote } = req.body;
  if (!title || !description || !type) {
    return res.status(400).json({ message: "Sarlavha, tavsif va ish turi majburiy" });
  }

  const job = await prisma.job.create({
    data: {
      title,
      description,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      type,
      experience: experience || "NO_EXPERIENCE",
      location: location || null,
      isRemote: isRemote === true || isRemote === "true",
      companyId: company.id,
    },
    include: { company: true },
  });

  // Telegram: obunachilarga + kanalga yuborish (token bo'lmasa jim o'tadi)
  try {
    await Promise.all([notifyNewJob(job), postJobToChannel(job)]);
  } catch (e) {
    console.error("Telegram xatosi:", e.message);
  }

  res.status(201).json(job);
}

// PUT /api/jobs/:id - faqat o'z vakansiyasini tahrirlash
async function updateJob(req, res) {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { company: true },
  });
  if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
  if (job.company.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Bu vakansiya sizga tegishli emas" });
  }

  const allowed = ["title", "description", "location", "type", "experience"];
  const data = {};
  for (const key of allowed) if (req.body[key] !== undefined) data[key] = req.body[key];
  if (req.body.salaryMin !== undefined) data.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : null;
  if (req.body.salaryMax !== undefined) data.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : null;
  if (req.body.isRemote !== undefined) data.isRemote = !!req.body.isRemote;
  if (req.body.status && ["OPEN", "CLOSED"].includes(req.body.status)) data.status = req.body.status;

  const updated = await prisma.job.update({ where: { id: job.id }, data });
  res.json(updated);
}

// DELETE /api/jobs/:id
async function deleteJob(req, res) {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { company: true },
  });
  if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
  if (job.company.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Bu vakansiya sizga tegishli emas" });
  }
  await prisma.job.delete({ where: { id: job.id } });
  res.json({ ok: true });
}

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob, myJobs };
