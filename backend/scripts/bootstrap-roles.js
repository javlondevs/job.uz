// Bir martalik rol sozlash (deployda ishlaydi, idempotent)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const FIXES = [
  ["admin@jobuz.uz", "ADMIN"],
  ["employer@jobuz.uz", "EMPLOYER"],
  ["employer2@jobuz.uz", "EMPLOYER"],
];

(async () => {
  for (const [email, role] of FIXES) {
    try {
      const u = await prisma.user.update({ where: { email }, data: { role } });
      console.log(`ROLE OK: ${u.email} -> ${u.role}`);
    } catch (e) {
      console.log(`SKIP ${email}: ${e.message.split("\n")[0]}`);
    }
  }
  await prisma.$disconnect();
})();
