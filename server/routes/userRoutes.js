import express from 'express';
import { addComment, applyForData, createUserBlog, createUserData ,deleteComment,deleteUserBlog,getAllBlogs,getSavedJobs,getUserApplicationsCount,getUserData, getUserJobApplication, paymentRazorPay, saveJob, unsaveJob, updateComment, updateResume, updateUserBlog, verifyRazorPay } from '../controllers/userController.js';
import {upload} from '../config/multeri.js';
import { getBlogComments } from '../controllers/companyController.js';

import { requireAuth } from '@clerk/express';
import { getUserActivityGraph } from '../controllers/activityController.js';
import { userAnalytics } from '../controllers/userAnalyticsController.js';
import { cacheBlogById, cacheBlogs, cacheUserProfile } from '../middlewares/cache.js';

const router = express.Router();
router.post('/user', createUserData);
router.get('/user/:id', cacheUserProfile, getUserData);
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
router.post("/blogs/:blogId/comments", requireAuth(), addComment);
router.put("/comments/:commentId", requireAuth(),updateComment);
router.delete("/comments/:commentId", requireAuth(), deleteComment);
router.post("/blogs", requireAuth(), createUserBlog);
router.put("/blogs/:id", cacheBlogById, requireAuth(), updateUserBlog);
router.delete("/blogs/:id", cacheBlogById, requireAuth(), deleteUserBlog);
router.get("/getAllBlogs", cacheBlogs, getAllBlogs)
router.get("/activity-graph/:id", getUserActivityGraph);
router.get("/analytics/:userId", userAnalytics);

export default router;
