import express from "express";
import { 
    changeJobApplicationStatus, 
    changeJobVisibility, 
    getCompanyData, 
    getCompanyJobApplicants, 
    getCompanyPostedJobs, 
    loginCompany, 
    postJob, 
    registerCompany, 
    resetPassword, 
    setInterviewDate, 
    setUpOTP,
    verifyOTP
} from "../controllers/companyController.js"; 

import upload from "../config/multer.js";
import protectCompany, { authMiddleware, comapnyDataProtection, ProtectCompany, ProtectionCompany } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", upload.single('image'), registerCompany);
router.post("/login", loginCompany);
router.get("/company", comapnyDataProtection, getCompanyData);
router.post("/post-job", authMiddleware, postJob);
router.get("/applicants", ProtectionCompany, getCompanyJobApplicants);
router.get("/list-jobs", comapnyDataProtection,getCompanyPostedJobs);
router.post("/change-status", ProtectionCompany,changeJobApplicationStatus);
router.post("/change-visiblity", ProtectionCompany ,changeJobVisibility);
router.post("/set-interview-date",ProtectionCompany, setInterviewDate);
router.post("/setUpOtp", setUpOTP)
router.post("/verifyOtp", verifyOTP)
router.post("/resetPassword", resetPassword)

export default router;
