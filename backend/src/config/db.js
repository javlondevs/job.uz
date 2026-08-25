// Prisma client - bitta ulanishni qayta ishlatamiz
const { PrismaClient } = require("@prisma/client");

// Render PostgreSQL uchun sslmode=require qo'shish
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("sslmode=")) {
  process.env.DATABASE_URL += "?sslmode=require";
}

const prisma = new PrismaClient();

module.exports = { prisma };
