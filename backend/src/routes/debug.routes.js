// VAQTINCHALIK diagnostic endpoint - ishlagandan keyin o'chiriladi
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/bootstrap", async (req, res) => {
  if (req.query.key !== process.env.JWT_SECRET) {
    return res.status(403).json({ message: "kalit noto'g'ri" });
  }
  const FIXES = [
    ["admin@jobuz.uz", "ADMIN"],
    ["employer@jobuz.uz", "EMPLOYER"],
    ["employer2@jobuz.uz", "EMPLOYER"],
  ];
  const fixed = [];
  for (const [email, role] of FIXES) {
    try {
      const u = await prisma.user.update({ where: { email }, data: { role } });
      fixed.push({ email, role: u.role });
    } catch (e) {
      fixed.push({ email, error: e.message.split("\n")[0].slice(0, 120) });
    }
  }
  let users = null;
  try {
    users = await prisma.user.findMany({ select: { email: true, role: true }, take: 50 });
  } catch (e) {
    users = [{ error: e.message.split("\n")[0].slice(0, 120) }];
  }
  res.json({ fixed, users });
});

module.exports = router;
