import express from 'express';
import { applyForData, createUserData ,getUserApplicationsCount,getUserData, getUserJobApplication, paymentRazorPay, updateResume, verifyRazorPay } from '../controllers/userController.js';
import upload from '../config/multer.js';

const router = express.Router();
router.post('/user', createUserData);
router.get('/user/:id', getUserData);
router.post('/apply/:id', applyForData);
router.get('/applications/:id', getUserJobApplication);
router.post('/update-resume/:id', upload.single('resume'), updateResume);
router.get('/applications/count/:id', getUserApplicationsCount);
router.post('/pay-razor', paymentRazorPay);
router.post('/verify-razor', verifyRazorPay)

export default router;
