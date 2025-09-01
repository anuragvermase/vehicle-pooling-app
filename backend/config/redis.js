import Redis from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(url, { lazyConnect: true });

export async function ensureRedis() {
  if (redis.status !== 'ready' && redis.status !== 'connecting') {
    await redis.connect().catch(() => {});
  }
  return redis;
}