import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

// Middleware to extract Clerk user ID from headers
export const getUserId = (req) => {
    const userId = req.headers["x-user-id"]; // Ensure frontend sends this header
    if (!userId) throw new Error("User ID not found in request headers");
    return userId;
};

export const getUserData = async (req, res) => {
    try {
        const userId = getUserId(req);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }
        return res.json({ success: true, user });
    } catch (err) {
        console.error(`Error in getUserData: ${err.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const applyForData = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { jobId } = req.body;

        if (!jobId) return res.status(400).json({ success: false, message: "Job ID is required" });

        const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });
        if (isAlreadyApplied) {
            return res.json({ success: false, message: "Already Applied" });
        }

        const jobData = await Job.findById(jobId);
        if (!jobData) {
            return res.status(404).json({ success: false, message: "Job Not Found" });
        }

        await JobApplication.create({
            userId,
            companyId: jobData.companyId,
            jobId,
            date: new Date()
        });

        return res.json({ success: true, message: "Applied Successfully" });
    } catch (err) {
        console.error(`Error in applyForData: ${err.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getUserJobApplication = async (req, res) => {
    try {
        const userId = getUserId(req);
        const applications = await JobApplication.find({ userId })
            .populate("companyId", "name email image")
            .populate("jobId", "title description category location salary")
            .exec();

        return res.json({ success: true, applications });
    } catch (err) {
        console.error(`Error in getUserJobApplication: ${err.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateResume = async (req, res) => {
    try {
        const userId = getUserId(req);
        const userData = await User.findById(userId);

        if (!userData) return res.status(404).json({ success: false, message: "User Not Found" });

        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

        const resumeUpload = await cloudinary.uploader.upload(req.file.path);
        userData.resume = resumeUpload.secure_url;

        await userData.save();
        return res.json({ success: true, message: "Resume Updated Successfully" });
    } catch (err) {
        console.error(`Error in updateResume: ${err.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
