// Company controller - kompaniyalar
const { prisma } = require("../config/db");

// GET /api/companies - ro'yxat + qidiruv
async function listCompanies(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);
  const skip = (page - 1) * limit;

  const where = {};
  if (req.query.q) {
    where.OR = [
      { name: { contains: req.query.q, mode: "insensitive" } },
      { sector: { contains: req.query.q, mode: "insensitive" } },
    ];
  }
  if (req.query.sector) where.sector = { contains: req.query.sector, mode: "insensitive" };

  const [total, companies] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { jobs: { where: { status: "OPEN" } } } } },
    }),
  ]);

  res.json({
    data: companies,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// GET /api/companies/:id - profil + ochiq vakansiyalar
async function getCompany(req, res) {
  const company = await prisma.company.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { name: true } },
      jobs: {
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { jobs: true } },
    },
  });
  if (!company) return res.status(404).json({ message: "Kompaniya topilmadi" });

  // Ochiq vakansiyalar soni
  company.openJobsCount = company.jobs.length;
  res.json(company);
}

// POST /api/companies - ish beruvchi kompaniya profili yaratadi
async function createCompany(req, res) {
  const existing = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
  if (existing) return res.status(409).json({ message: "Sizda allaqachon kompaniya bor" });

  const { name, description, sector, location, website } = req.body;
  if (!name) return res.status(400).json({ message: "Kompaniya nomi majburiy" });

  // Agar fayl yuklangan bo'lsa - statik URL hosil qilamiz
  const logoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.logoUrl || null;

  const company = await prisma.company.create({
    data: { name, description, sector, location, website, logoUrl, ownerId: req.user.id },
  });
  res.status(201).json(company);
}

// PUT /api/companies/:id - o'z kompaniyasini tahrirlash
async function updateCompany(req, res) {
  const company = await prisma.company.findUnique({ where: { id: req.params.id } });
  if (!company) return res.status(404).json({ message: "Kompaniya topilmadi" });
  if (company.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Ruxsat yo'q" });
  }

  const allowed = ["name", "description", "sector", "location", "website"];
  const data = {};
  for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k];
  // Yangi logotip yuklangan bo'lsa
  if (req.file) data.logoUrl = `/uploads/${req.file.filename}`;
  else if (req.body.logoUrl !== undefined) data.logoUrl = req.body.logoUrl;

  const updated = await prisma.company.update({ where: { id: company.id }, data });
  res.json(updated);
}

module.exports = { listCompanies, getCompany, createCompany, updateCompany };
