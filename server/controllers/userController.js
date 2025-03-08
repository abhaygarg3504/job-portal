import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

export const getUserId = (req) => {
    const userId = req.query.id;
    if (!userId) throw new Error("User ID not found in request query");
    return userId;
};

export const getUserData = async (req, res) => {
    try {
        const id = req.params.id; // ✅ Get user ID from URL params

        if (!id) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, user });
    } catch (err) {
        console.error(`Error in getUserData: ${err.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Create a new function to handle user creation
export const createUserData = async (req, res) => {
    try {
        const { id, name, resume, image, email } = req.body; // ✅ Get user data from request body

        if (!id || !email) {
            return res.status(400).json({ success: false, message: "User ID and Email are required" });
        }

        let user = await User.findById(id);
        if (!user) {
            user = new User({ _id: id, name, resume, image, email });
            await user.save();
        }

        return res.json({ success: true, user });
    } catch (err) {
        console.error(`Error in createUserData: ${err.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateResume = async (req, res) => {
    try {
        // ✅ Extract user ID from Clerk Auth middleware
        const userId = req.params.id; 

        if (!userId) {
            console.log("can't get userId");
            return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
        }

        // ✅ Find the user in MongoDB
        let userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // ✅ Upload resume to Cloudinary
        const resumeUpload = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto", // Ensures PDFs are handled correctly
        });

        // ✅ Update user resume in MongoDB
        userData.resume = resumeUpload.secure_url;
        await userData.save();

        return res.json({ 
            success: true, 
            message: "Resume Updated Successfully", 
            user: userData // ✅ Return updated user data
        });
    } catch (err) {
        console.error(`Error in updateResume: ${err.message}`);
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




// export const updateResume = async (req, res) => {
//     try {
//         if (!req.user) {
//             return res.status(401).json({ success: false, message: "Unauthorized: No user found" });
//         }

//         const userData = await User.findById(req.user._id);
//         if (!userData) {
//             return res.status(404).json({ success: false, message: "User Not Found" });
//         }

//         if (!req.file) {
//             return res.status(400).json({ success: false, message: "No file uploaded" });
//         }

//         // Upload resume to Cloudinary
//         const resumeUpload = await cloudinary.uploader.upload(req.file.path, {
//             resource_type: "auto",
//         });

//         userData.resume = resumeUpload.secure_url;
//         await userData.save();

//         return res.json({ success: true, message: "Resume Updated Successfully", resume: resumeUpload.secure_url });
//     } catch (err) {
//         console.error(`Error in updateResume: ${err.message}`);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

