// server/config/redis.js
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis(process.env.REDIS_URL); // e.g., redis://default:password@host:port

redis.on('connect', () => console.log('✅ ioredis connected'));
redis.on('error', (err) => console.error('❌ ioredis error:', err));

export default redis;
