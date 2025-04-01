import express from "express";
import { 
    changeJobApplicationStatus, 
    changeJobVisibility, 
    getCompanyData, 
    getCompanyJobApplicants, 
    getCompanyPostedJobs, 
    loginCompany, 
    postJob, 
    registerCompany 
} from "../controllers/companyController.js"; 

import upload from "../config/multer.js";
import { authMiddleware, comapnyDataProtection, ProtectCompany, ProtectionCompany } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", upload.single('image'), registerCompany);
router.post("/login", loginCompany);
router.get("/company", comapnyDataProtection, getCompanyData);
router.post("/post-job", authMiddleware, postJob);
router.get("/applicants", ProtectionCompany, getCompanyJobApplicants);
router.get("/list-jobs", comapnyDataProtection,getCompanyPostedJobs);
router.post("/change-status", ProtectionCompany,changeJobApplicationStatus);
router.post("/change-visiblity", ProtectionCompany ,changeJobVisibility); 

export default router;
