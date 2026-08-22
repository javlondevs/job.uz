// CV controller - CV yaratish, saqlash, tahrirlash
const { prisma } = require("../config/db");

// GET /api/cv - mening CV larim
async function myCvs(req, res) {
  const cvs = await prisma.cV.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: "desc" },
  });
  res.json(cvs);
}

// GET /api/cv/:id
async function getCv(req, res) {
  const cv = await prisma.cV.findUnique({ where: { id: req.params.id } });
  if (!cv) return res.status(404).json({ message: "CV topilmadi" });
  if (cv.userId !== req.user.id) return res.status(403).json({ message: "Ruxsat yo'q" });
  res.json(cv);
}

// POST /api/cv - yangi CV
async function createCv(req, res) {
  const { title, personalInfo, experience, education, skills, languages, template } = req.body;

  const cv = await prisma.cV.create({
    data: {
      userId: req.user.id,
      title: title || "Mening CV im",
      personalInfo: personalInfo || {},
      experience: experience || [],
      education: education || [],
      skills: skills || [],
      languages: languages || [],
      template: template || "modern",
    },
  });
  res.status(201).json(cv);
}

// PUT /api/cv/:id
async function updateCv(req, res) {
  const existing = await prisma.cV.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "CV topilmadi" });
  if (existing.userId !== req.user.id) return res.status(403).json({ message: "Ruxsat yo'q" });

  const allowed = ["title", "personalInfo", "experience", "education", "skills", "languages", "template"];
  const data = {};
  for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k];

  const cv = await prisma.cV.update({ where: { id: existing.id }, data });
  res.json(cv);
}

// DELETE /api/cv/:id
async function deleteCv(req, res) {
  const existing = await prisma.cV.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "CV topilmadi" });
  if (existing.userId !== req.user.id) return res.status(403).json({ message: "Ruxsat yo'q" });

  await prisma.cV.delete({ where: { id: existing.id } });
  res.json({ ok: true });
}

module.exports = { myCvs, getCv, createCv, updateCv, deleteCv };
