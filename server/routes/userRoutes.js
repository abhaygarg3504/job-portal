import express from 'express';
import { applyForData, getUserData, getUserJobApplication, updateResume } from '../controllers/userController.js';
import upload from '../config/multer.js';

const router = express.Router();

// Update to POST for applying
router.get('/user', getUserData);
router.post('/apply', applyForData);
router.get('/applications', getUserJobApplication);
router.post('/update-resume', upload.single('resume'), updateResume);

export default router;
