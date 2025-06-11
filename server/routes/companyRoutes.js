import express from "express";
import { 
    addCompanyComment,
    changeJobApplicationStatus, 
    changeJobVisibility, 
    createBlog, 
    deleteBlog, 
    deleteCompanyComment, 
    getBlogComments, 
    getCompanyData, 
    getCompanyJobApplicants, 
    getCompanyPostedJobs, 
    loginCompany, 
    postJob, 
    registerCompany, 
    resetPassword, 
    setInterviewDate, 
    setUpOTP,
    updateBlog,
    updateCompanyComment,
    verifyOTP
} from "../controllers/companyController.js"; 

import upload from "../config/multer.js";
import protectCompany, { authMiddleware, comapnyDataProtection, ProtectCompany, ProtectionCompany } from "../middlewares/auth.js";
import { getAllBlogs } from "../controllers/userController.js";
import { getCompanyActivityGraph } from "../controllers/activityController.js";
import { getCompanyAnalytics } from "../controllers/companyAnalyticsController.js";
import { cacheBlogById, cacheBlogs, cacheCommentsByBlogId, cacheCompanyProfile } from "../middlewares/cache.js";
import { blogLimiter, loginLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", upload.single('image'), registerCompany);
router.post("/login", loginLimiter, cacheCompanyProfile, loginCompany);
router.get("/company", cacheCompanyProfile, comapnyDataProtection, getCompanyData);
router.post("/post-job", authMiddleware, postJob);
router.get("/applicants", ProtectionCompany, getCompanyJobApplicants);
router.get("/list-jobs", ProtectionCompany,getCompanyPostedJobs);
router.post("/change-status", ProtectionCompany,changeJobApplicationStatus);
router.post("/change-visibility", ProtectionCompany ,changeJobVisibility);
router.post("/blogs", blogLimiter, ProtectionCompany, createBlog)
router.post("/set-interview-date",ProtectionCompany, setInterviewDate);
router.put("/blogs/:id", cacheBlogById, ProtectionCompany, updateBlog);
router.delete("/blogs/:id", cacheBlogById, ProtectionCompany, deleteBlog);
router.get("/getAllBlogs", cacheBlogs, getAllBlogs)
router.post("/blogs/:blogId/comments", ProtectionCompany, addCompanyComment);
router.put("/comments/:commentId", cacheCommentsByBlogId, ProtectionCompany, updateCompanyComment);
router.delete("/comments/:commentId", cacheCommentsByBlogId, ProtectionCompany, deleteCompanyComment);
router.get("/blogs/:blogId/comments", cacheCommentsByBlogId, getBlogComments);
router.post("/setUpOtp", setUpOTP)
router.post("/verifyOtp", verifyOTP)
router.post("/resetPassword", resetPassword)
router.get("/activity-graph/:id", getCompanyActivityGraph);
router.get('/analytics/:companyId', getCompanyAnalytics);

export default router;
