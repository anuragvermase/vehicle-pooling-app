import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

(async () => {
  try {
    await connectDB();
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !password) {
      console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env');
      process.exit(1);
    }
    let u = await User.findOne({ email });
    if (!u) {
      u = await User.create({ name: 'Super Admin', email, password, role: 'superadmin' });
    } else if (u.role !== 'superadmin') {
      u.role = 'superadmin';
      await u.save();
    }
    console.log('✅ Superadmin ready:', u.email);
    process.exit(0);
  } catch (e) {
    console.error('Seed admin failed:', e);
    process.exit(1);
  }
})();
