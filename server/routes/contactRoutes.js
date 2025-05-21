import express from "express";
import { getContacts } from "../controllers/contactController.js";
import { getInterviewDetails } from "../controllers/companyController.js";
const router = express.Router();

router.get("/",  getContacts );
router.get("/interviews", getInterviewDetails);
export default router;
