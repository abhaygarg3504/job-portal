import express from 'express';
import { getJobs , getJobById, getJobCount} from '../controllers/jobController.js';

const router = express.Router();
router.get('/',  getJobs)
router.get('/count/total', getJobCount);
router.get('/:id', getJobById);

export default router