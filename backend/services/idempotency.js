// backend/services/idempotency.js
import { ensureRedis } from '../config/redis.js';

/**
 * ensureOp(opKey) returns true the first time, false if duplicate within TTL.
 * opKey tip: ${userId}:${opId}
 * @param {string} opKey
 * @param {number} ttlSeconds  default 3600 (1 hour)
 * @returns {Promise<boolean>}
 */
export async function ensureOp(opKey, ttlSeconds = 3600) {
  if (!opKey) return false;
  const r = await ensureRedis();
  // SET if Not eXists with EXpiry
  const ok = await r.set(`op:${opKey}`, '1', 'NX', 'EX', ttlSeconds);
  return !!ok;
}

// Also export default so either import style works
export default ensureOp;