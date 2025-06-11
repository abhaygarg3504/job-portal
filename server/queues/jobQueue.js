// server/queues/jobQueue.js
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL);

export const jobQueue = new Queue('jobQueue', { connection });