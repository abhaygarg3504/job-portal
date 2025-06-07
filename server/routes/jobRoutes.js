import express from 'express';
import { getJobs , getJobById, getJobCount} from '../controllers/jobController.js';
const router = express.Router();

router.get('/', getJobs)
router.get('/:id', getJobById);
router.get('/count/total', getJobCount);

export default router