import express from 'express';
import { applyForData, createUserData ,getUserData, getUserJobApplication, updateResume } from '../controllers/userController.js';
import upload from '../config/multer.js';

const router = express.Router();
router.post('/user', createUserData);
router.get('/user/:id', getUserData);
router.post('/apply', applyForData);
router.get('/applications', getUserJobApplication);
router.post('/update-resume', upload.single('resume'), updateResume);

export default router;