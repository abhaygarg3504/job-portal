import express from 'express';
import { addComment, applyForData, createUserData ,deleteComment,getAllBlogs,getSavedJobs,getUserApplicationsCount,getUserData, getUserJobApplication, paymentRazorPay, saveJob, unsaveJob, updateComment, updateResume, verifyRazorPay } from '../controllers/userController.js';
import upload from '../config/multer.js';
import { getBlogComments } from '../controllers/companyController.js';

const router = express.Router();
router.post('/user', createUserData);
router.get('/user/:id', getUserData);
router.post('/apply/:id', applyForData);
router.get('/applications/:id', getUserJobApplication);
router.post('/update-resume/:id', upload.single('resume'), updateResume);
router.get('/applications/count/:id', getUserApplicationsCount);
router.post('/pay-razor', paymentRazorPay);
router.post('/verify-razor', verifyRazorPay)
router.post("/save-job/:id", saveJob);
router.post("/unsave-job/:id", unsaveJob);
router.get("/saved-jobs/:id", getSavedJobs);
router.get("/blogs/:blogId/comments", getBlogComments);
router.post("/blogs/:blogId/comments", addComment);
router.put("/comments/:commentId", updateComment);
router.delete("/comments/:commentId", deleteComment);
router.get("/getAllBlogs", getAllBlogs)

export default router;
