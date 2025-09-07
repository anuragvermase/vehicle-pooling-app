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

// POST /api/users/me/avatar  (field: "avatar")
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
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both fields are required." });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }

    // Fetch user with password for comparison
    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Verify current password against stored hash
    const ok = await bcrypt.compare(String(currentPassword), String(user.password || ""));
    if (!ok) {
      // <<< explicit message for wrong current password
      return res.status(401).json({ success: false, message: "Current password does not match." });
    }

    // Set plaintext new password; model pre('save') will hash it ONCE
    user.password = String(newPassword);
    await user.save();

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Password update failed." });
  }
});

/* === DELETE /api/users/me — permanently delete the current user */
router.delete("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("profilePicture avatar avatarUrl");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Optional: try to remove local avatar file if it’s under /uploads/avatars
    const url = user.profilePicture || user.avatarUrl || user.avatar;
    try {
      if (url && url.includes("/uploads/avatars/")) {
        const fileName = url.split("/uploads/avatars/")[1];
        const filePath = path.join(__dirname, "..", "uploads", "avatars", fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } catch { /* ignore file errors */ }

    await User.findByIdAndDelete(req.user.id);

    return res.status(204).end(); // No content
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;
