// backend/routes/user.js
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/* ------------ cross-platform path resolution ------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/avatars exists at: backend/uploads/avatars
const uploadRoot = path.join(__dirname, "..", "uploads", "avatars");
fs.mkdirSync(uploadRoot, { recursive: true });

/* ------------------ Multer for avatar uploads -------------------- */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    cb(null, base + ext);
  },
});
const fileFilter = (_req, file, cb) => {
  const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
  cb(ok ? null : new Error("Only image files allowed"), ok);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* --------------------------- Routes ------------------------------ */

// GET /api/users/me -> canonical current user
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  const safe = user.toObject();
  safe.avatarUrl = safe.profilePicture || safe.avatar || null;
  res.set("Cache-Control", "no-store");
  res.json({ success: true, user: safe });
});

// PATCH /api/users/me — allow name/phone/email/avatarUrl (maps to profilePicture)
router.patch("/me", protect, async (req, res) => {
  const allowed = ["name", "phone", "email", "avatarUrl", "profilePicture"];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  if (update.avatarUrl) {
    update.profilePicture = update.avatarUrl;
    delete update.avatarUrl;
  }

  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const safe = user.toObject();
  safe.avatarUrl = safe.profilePicture || safe.avatar || null;
  res.set("Cache-Control", "no-store");
  res.json({ success: true, user: safe });
});

// GET /api/users/me/settings
router.get("/me/settings", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("settings");
  res.json({ success: true, settings: user?.settings || {} });
});

// PUT /api/users/me/settings
router.put("/me/settings", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  user.settings = { ...(user.settings || {}), ...(req.body || {}) };
  await user.save();
  res.json({ success: true, settings: user.settings });
});

// POST /api/users/me/avatar  (field: "avatar") -> { success, url, avatarUrl }
router.post("/me/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file" });
    const base = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
    const url = `${base}/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: url, avatarUrl: url, avatar: url },
      { new: true }
    ).select("-password");

    const safe = user.toObject();
    safe.avatarUrl = safe.profilePicture || safe.avatar || null;
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, url, avatarUrl: url, user: safe });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// POST /api/users/me/password  { currentPassword, newPassword }
router.post("/me/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Missing password fields" });
    if (String(newPassword).length < 8)
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const ok = await bcrypt.compare(String(currentPassword), String(user.password || ""));
    if (!ok) return res.status(401).json({ success: false, message: "Current password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(newPassword), salt);
    await user.save();

    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Password update failed" });
  }
});

export default router;