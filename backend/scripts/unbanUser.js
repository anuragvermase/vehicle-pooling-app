// backend/scripts/unbanUser.js
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const emailFromArg = process.argv.find(a => a.startsWith('--email='))?.split('=')[1];
const EMAIL = emailFromArg || process.env.UNBAN_EMAIL;

if (!EMAIL) {
  console.error('❌ Provide an email via --email=user@domain.com or set UNBAN_EMAIL in .env');
  process.exit(1);
}

(async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email: EMAIL.toLowerCase() });
    if (!user) {
      console.error(`❌ User not found for email: ${EMAIL}`);
      process.exit(1);
    }

    if (user.isBanned) {
      user.isBanned = false;
      await user.save();
      console.log(`✅ Unbanned: ${user.email} (id=${user._id})`);
    } else {
      console.log(`ℹ️  User was not banned: ${user.email}`);
    }

    // Optional: promote to superadmin if you locked yourself out of admin UI
    const promote = process.argv.includes('--promote=superadmin');
    if (promote && user.role !== 'superadmin') {
      user.role = 'superadmin';
      await user.save();
      console.log(`👑 Promoted to superadmin: ${user.email}`);
    }

    process.exit(0);
  } catch (e) {
    console.error('❌ Unban script failed:', e);
    process.exit(1);
  }
})();
