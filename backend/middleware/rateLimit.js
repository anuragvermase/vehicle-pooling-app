import { ensureRedis } from '../config/redis.js';

// simple sliding window: limit reqs per key per minute
export function rateLimit({ key = (req)=>req.ip, limit = 120, windowSec = 60 } = {}) {
  return async (req, res, next) => {
    try {
      const r = await ensureRedis();
      const k = `rl:${key(req)}`;
      const now = Date.now();
      await r.zadd(k, now, `${now}:${Math.random()}`);
      await r.zremrangebyscore(k, 0, now - windowSec*1000);
      const count = await r.zcard(k);
      await r.expire(k, windowSec);
      if (count > limit) return res.status(429).json({ success:false, message:'Too many requests' });
      next();
    } catch (e) { next(e); }
  }
}