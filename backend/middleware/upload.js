// backend/middleware/upload.js
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const root = path.join(__dirname, "..", "uploads", "avatars");
fs.mkdirSync(root, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, root),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8);
    cb(null, base + ext);
  },
});

function fileFilter(_, file, cb) {
  const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
  cb(ok ? null : new Error("Only image files allowed"), ok);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;