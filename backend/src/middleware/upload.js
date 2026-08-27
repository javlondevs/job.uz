// Multer - logotip yuklash sozlamalari
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // noqulay belgilarni tozalash + unikal nom
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.mimetype);
    if (!ok) return cb(new Error("Faqat rasm fayllariga ruxsat beriladi"));
    cb(null, true);
  },
});

module.exports = { upload };
