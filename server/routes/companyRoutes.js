import express from "express";
import { 
    addCompanyComment,
    changeJobApplicationStatus, 
    changeJobVisibility, 
    createBlog, 
    deleteBlog, 
    deleteCompanyComment, 
    deleteJob, 
    downloadCompanyApplicationsExcel, 
    getBlogComments, 
    getCompanyActivityGraphBySlug, 
    getCompanyBlogsBySlug, 
    getCompanyData, 
    getCompanyDataBySlug, 
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
    uploadJobsExcel,
    verifyOTP
} from "../controllers/companyController.js"; 

import upload from "../config/multer.js";
import  { authMiddleware, comapnyDataProtection, ProtectCompany, ProtectionCompany } from "../middlewares/auth.js";
import { getAllBlogs } from "../controllers/userController.js";
import { getCompanyActivityGraph } from "../controllers/activityController.js";
import { getCompanyAnalytics } from "../controllers/companyAnalyticsController.js";
import uploadExcel from "../config/multerExcel.js";
// import { blogLimiter, loginLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", upload.single('image'), registerCompany);
router.post("/login", loginCompany);
router.get("/company", comapnyDataProtection, getCompanyData);
router.post("/post-job", authMiddleware, postJob);
router.get("/applicants", ProtectionCompany, getCompanyJobApplicants);
router.get("/list-jobs", ProtectionCompany,getCompanyPostedJobs);
router.post("/change-status", ProtectionCompany,changeJobApplicationStatus);
router.post("/change-visibility", ProtectionCompany ,changeJobVisibility);
router.post("/blogs", ProtectionCompany, createBlog)
router.post("/set-interview-date",ProtectionCompany, setInterviewDate);
router.put("/blogs/:id", ProtectionCompany, updateBlog);
router.delete("/blogs/:id", ProtectionCompany, deleteBlog);
router.get("/getAllBlogs", getAllBlogs)
router.post("/blogs/:blogId/comments", ProtectionCompany, addCompanyComment);
router.put("/comments/:commentId", ProtectionCompany, updateCompanyComment);
router.delete("/comments/:commentId", ProtectionCompany, deleteCompanyComment);
router.get("/blogs/:blogId/comments", getBlogComments);
router.post("/setUpOtp", setUpOTP)
router.post("/verifyOtp", verifyOTP)
router.post("/resetPassword", resetPassword)
router.get("/activity-graph/:id", getCompanyActivityGraph);
router.get('/analytics/:companyId', getCompanyAnalytics);
router.delete('/delete/:id', ProtectionCompany, deleteJob);
router.post("/upload-jobs-excel", ProtectionCompany,uploadExcel.single("file"),uploadJobsExcel);
router.get("/applications/excel", ProtectionCompany, downloadCompanyApplicationsExcel);
router.get("/profile/:slug", getCompanyDataBySlug)
router.get("/profile/:slug/activity", getCompanyActivityGraphBySlug)
router.get("/profile/:slug/blogs", getCompanyBlogsBySlug)

export default router;
