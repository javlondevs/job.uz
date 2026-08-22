// Application controller - vakansiyaga ariza qoldirish va boshqarish
const { prisma } = require("../config/db");

// POST /api/applications - ish qidiruvchi ariza qoldiradi
async function apply(req, res) {
  const { jobId, cvId, coverLetter } = req.body;
  if (!jobId) return res.status(400).json({ message: "jobId kerak" });

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
  if (job.status !== "OPEN") return res.status(400).json({ message: "Bu vakansiya yopilgan" });

  // Takroriy arizani tekshirish
  const existing = await prisma.application.findUnique({
    where: { jobId_userId: { jobId, userId: req.user.id } },
  });
  if (existing) return res.status(409).json({ message: "Siz allaqachon ariza qoldirgansiz" });

  // CV berilgan bo'lsa tegishliligini tekshiramiz
  if (cvId) {
    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv || cv.userId !== req.user.id) {
      return res.status(403).json({ message: "Bu CV sizga tegishli emas" });
    }
  }

  const application = await prisma.application.create({
    data: { jobId, userId: req.user.id, cvId: cvId || null, coverLetter },
    include: { job: { include: { company: true } }, cv: true },
  });

  res.status(201).json(application);
}

// GET /api/applications/mine - o'z arizalarim
async function myApplications(req, res) {
  const apps = await prisma.application.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      job: { include: { company: { select: { name: true, logoUrl: true } } } },
    },
  });
  res.json(apps);
}

// GET /api/applications/job/:jobId - vakansiya bo'yicha kelgan arizalar (faqat egasi)
async function jobApplications(req, res) {
  const job = await prisma.job.findUnique({
    where: { id: req.params.jobId },
    include: { company: true },
  });
  if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
  if (job.company.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Ruxsat yo'q" });
  }

  const apps = await prisma.application.findMany({
    where: { jobId: job.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      cv: true,
    },
  });
  res.json(apps);
}

// PUT /api/applications/:id/status - holatni o'zgartirish (faqat ish beruvchi)
async function updateStatus(req, res) {
  const { status } = req.body;
  if (!["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Noto'g'ri holat" });
  }

  const app = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { job: { include: { company: true } } },
  });
  if (!app) return res.status(404).json({ message: "Ariza topilmadi" });
  if (app.job.company.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Ruxsat yo'q" });
  }

  const updated = await prisma.application.update({
    where: { id: app.id },
    data: { status },
  });
  res.json(updated);
}

module.exports = { apply, myApplications, jobApplications, updateStatus };
