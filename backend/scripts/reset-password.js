const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log("Ishlatish: node scripts/reset-password.js <email> <parol>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("Foydalanuvchi topilmadi:", email);
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
  console.log(`✅ ${email} paroli yangilandi: ${newPassword}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
