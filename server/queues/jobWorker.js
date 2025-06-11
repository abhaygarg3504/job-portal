import { Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import Job from '../models/Job.js';
import Company from '../models/Comapny.js'; // ✅ ADD THIS LINE

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

console.log('👷 Worker starting...');

(async () => {
  await connectDB();

  const worker = new Worker(
    'jobQueue',
    async (job) => {
      if (job.name === 'newJobPosted') {
        const jobDetails = await Job.findById(job.data.jobId).populate('companyId', 'name email');
        if (!jobDetails) {
          console.warn(`⚠️ Job with ID ${job.data.jobId} not found`);
          return;
        }

        console.log('🔔 New Job Posted:', {
          title: jobDetails.title,
          company: jobDetails.companyId.name,
          email: jobDetails.companyId.email,
        });
      }
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
  });

  const queueEvents = new QueueEvents('jobQueue', { connection });
  queueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`🚨 Job ${jobId} failed: ${failedReason}`);
  });
})();
