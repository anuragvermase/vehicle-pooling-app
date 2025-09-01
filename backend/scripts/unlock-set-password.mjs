import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config({ path: "./.env" });

async function main() {
  const [,, emailArg, newPass] = process.argv;
  if (!emailArg || !newPass) {
    console.log("Usage: node scripts/reset-password.mjs <email> <NewPassword123!>");
    process.exit(1);
  }
  const email = String(emailArg).toLowerCase();

  await mongoose.connect(process.env.MONGODB_URI, {});

  const user = await User.findOne({ email }).select("+password +loginAttempts +lockUntil");
  if (!user) {
    console.log("No user found for", email);
    process.exit(1);
  }

  // Set PLAIN password; your pre-save hook will hash it once
  user.password = String(newPass);

  // Also unlock the account immediately
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();
  console.log("✅ Password reset & account unlocked for", email);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });