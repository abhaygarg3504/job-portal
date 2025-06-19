import express from 'express';
import { addComment, applyForData, createUserBlog, createUserData ,deleteComment,deleteUserBlog,downloadUserApplicationsExcel,getActivityGraphBySlug,getAllBlogs,getJobRecommendations,getResumeBlob,getSavedJobs,getUserApplicationsCount,getUserBySlug,getUserData, getUserJobApplication, parseAndUpdateProfileFromResume, paymentRazorPay, saveJob, unsaveJob, updateComment, updateResume, updateUserBlog, updateUserProfile, verifyRazorPay } from '../controllers/userController.js';
import upload from '../config/multeri.js';
import { getBlogComments } from '../controllers/companyController.js';

import { requireAuth } from '@clerk/express';
import { getUserActivityGraph } from '../controllers/activityController.js';
import { userAnalytics } from '../controllers/userAnalyticsController.js';
const router = express.Router();
router.post('/user', createUserData);
router.get('/user/:id', getUserData);
router.post('/apply/:id',  applyForData);
router.get('/applications/:id', getUserJobApplication);
router.post('/update-resume/:id', upload.single("resume"), updateResume);
router.get('/applications/count/:id', getUserApplicationsCount);
router.get("/profile/:slug", getUserBySlug);
router.get("/profile/:slug/activity-graph", getActivityGraphBySlug);
router.post('/pay-razor', paymentRazorPay);
router.get('/resume-blob/:id', getResumeBlob);
router.post('/verify-razor', verifyRazorPay)
router.post("/save-job/:id", saveJob);
router.post("/unsave-job/:id", unsaveJob);
router.get("/saved-jobs/:id", getSavedJobs);
router.get("/blogs/:blogId/comments", getBlogComments);
router.post("/blogs/:blogId/comments", requireAuth(), addComment);
router.put("/comments/:commentId", requireAuth(),updateComment);
router.delete("/comments/:commentId", requireAuth(), deleteComment);
router.post("/blogs", requireAuth(), createUserBlog);
router.put("/blogs/:id", requireAuth(), updateUserBlog);
router.delete("/blogs/:id", requireAuth(), deleteUserBlog);
router.get("/getAllBlogs", getAllBlogs)
router.get("/activity-graph/:id", getUserActivityGraph);
router.get("/analytics/:userId", userAnalytics);
router.put('/update/:id', updateUserProfile);
router.post('/parse-resume/:id', parseAndUpdateProfileFromResume);
router.get("/applications/excel/:id", downloadUserApplicationsExcel);
router.get("/recommendations/:id", getJobRecommendations);

export default router;
