import express from 'express';
import { addComment, applyForData, createUserBlog, createUserData ,deleteComment,deleteUserBlog,getAllBlogs,getResumeBlob,getSavedJobs,getUserApplicationsCount,getUserData, getUserJobApplication, paymentRazorPay, saveJob, unsaveJob, updateComment, updateResume, updateUserBlog, verifyRazorPay } from '../controllers/userController.js';
import upload from '../config/multeri.js';
import { getBlogComments } from '../controllers/companyController.js';

import { requireAuth } from '@clerk/express';
import { getUserActivityGraph } from '../controllers/activityController.js';
import { userAnalytics } from '../controllers/userAnalyticsController.js';
import { cacheBlogById, cacheBlogs, cacheCommentsByBlogId, cacheUserProfile } from '../middlewares/cache.js';
import { applyJobLimiter, blogLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();
router.post('/user', createUserData);
router.get('/user/:id', cacheUserProfile, getUserData);
router.post('/apply/:id', applyJobLimiter,  applyForData);
router.get('/applications/:id', getUserJobApplication);
router.post('/update-resume/:id', upload.single("resume"), updateResume);
router.get('/applications/count/:id', getUserApplicationsCount);
router.post('/pay-razor', paymentRazorPay);
router.get('/resume-blob/:id', getResumeBlob);
router.post('/verify-razor', verifyRazorPay)
router.post("/save-job/:id", saveJob);
router.post("/unsave-job/:id", unsaveJob);
router.get("/saved-jobs/:id", getSavedJobs);
router.get("/blogs/:blogId/comments",cacheCommentsByBlogId, getBlogComments);
router.post("/blogs/:blogId/comments", requireAuth(), addComment);
router.put("/comments/:commentId",cacheCommentsByBlogId, requireAuth(),updateComment);
router.delete("/comments/:commentId", cacheCommentsByBlogId, requireAuth(), deleteComment);
router.post("/blogs", blogLimiter, requireAuth(), createUserBlog);
router.put("/blogs/:id", cacheBlogById, requireAuth(), updateUserBlog);
router.delete("/blogs/:id", cacheBlogById, requireAuth(), deleteUserBlog);
router.get("/getAllBlogs", cacheBlogs, getAllBlogs)
router.get("/activity-graph/:id", getUserActivityGraph);
router.get("/analytics/:userId", userAnalytics);

export default router;
