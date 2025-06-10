import express from 'express';
import { getJobs , getJobById, getJobCount} from '../controllers/jobController.js';
import { cacheJobById, cacheJobs } from '../middlewares/cache.js';
const router = express.Router();

router.get('/', cacheJobs, getJobs)
router.get('/:id', cacheJobById, getJobById);
router.get('/count/total', getJobCount);

export default router