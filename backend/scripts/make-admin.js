// Foydalanuvchini admin qilish: node scripts/make-admin.js email@example.com
// (yoki rol o'zgartirish: node scripts/make-admin.js email@x.com EMPLOYER)
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const [email, role = "ADMIN"] = process.argv.slice(2);
  if (!email) {
    console.log("Ishlatish: node scripts/make-admin.js <email> [ADMIN|EMPLOYER|JOB_SEEKER]");
    process.exit(1);
  }
  if (!["ADMIN", "EMPLOYER", "JOB_SEEKER"].includes(role)) {
    console.log("Rol noto'g'ri: ADMIN, EMPLOYER yoki JOB_SEEKER bo'lsin");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`"${email}" topilmadi. Avval saytda ro'yxatdan o'tkazing.`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role },
    select: { name: true, email: true, role: true },
  });
  console.log("✅ Yangilandi:", updated);
}

main()
  .catch((e) => {
    console.error("Xato:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
