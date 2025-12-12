import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import transactionModel from "../models/transactionModel.js";
import User from "../models/User.js";
import Razorpay from "razorpay"
import { PrismaClient } from "@prisma/client";
import slugify from "slugify"; 
const prisma = new PrismaClient();
import Company from "../models/Comapny.js";
import { v2 as cloudinary } from "cloudinary";
import { logUserActivity } from "../middlewares/activityTrack.js";
import axios from "axios"
import XLSX from "xlsx";
import { parseResumeFromUrl } from "../utils/resumeParser.js";
import { getActivityGraphByRole} from "./activityController.js";
export const getUserId = (req) => {
    const userId = req.query.id;
    if (!userId) throw new Error("User ID not found in request query");
    return userId;
};

export const getUserData = async (req, res) => {
    try {
        const id = req.params.id;
        
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
    const userId = req.params.id;
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const publicId = `resume_${userId}_${Date.now()}.pdf`;

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "resume",
          public_id: publicId,
          use_filename: true,       // optional: uses the original filename too
          unique_filename: false,   // optional: prevents Cloudinary from appending random chars
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    if (!uploadResult?.secure_url) {
      return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
    }

    const pdfUrl = uploadResult.secure_url;
    await User.findByIdAndUpdate(userId, { resume: pdfUrl });
    await logUserActivity(userId, "update_resume");

    res.json({ success: true, message: "Resume updated successfully", resume: pdfUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const getResumeBlob = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user || !user.resume) {
      return res.status(404).json({ success: false, message: "No resume found" });
    }

    // Try to fetch the PDF from Cloudinary
    let cloudRes;
    try {
      cloudRes = await axios.get(user.resume, { responseType: "arraybuffer" });
    } catch (err) {
      // If Cloudinary returns 404, clean up the user's resume field
      if (err.response && err.response.status === 404) {
        user.resume = undefined;
        await user.save();
        return res.status(404).json({ success: false, message: "Resume not found on Cloudinary. Please re-upload." });
      }
      throw err;
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="resume.pdf"',
      "Cache-Control": "no-store"
    });
    res.send(cloudRes.data);
  } catch (err) {
    console.error("Error streaming resume:", err);
    res.status(500).json({ success: false, message: "Could not stream resume" });
  }
};

export const applyForData = async (req, res) => {
    try {
        // const userId = getUserId(req);
        const userId = req.params.id;

        if (!userId) {
            console.log("Can't get user ID");
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

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
        await logUserActivity(userId, "apply_job");

        return res.json({ success: true, message: "Applied Successfully" });
    } catch (err) {
        console.error(`Error in applyForData: ${err.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getUserJobApplication = async (req, res) => {
    try {
        // const userId = getUserId(req);
        const userId = req.params.id;

        if (!userId) {
            console.log("Can't get user ID");
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const applications = await JobApplication.find({ userId, jobId: { $ne: null } })
    .populate("companyId", "name email image")
    .populate("jobId", "title description category location salary")
    .exec();

        return res.json({ success: true, applications });
    } catch (err) {
        console.error(`Error in getUserJobApplication: ${err.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getUserApplicationsCount = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find applications by userId and populate job title and company name
    const applications = await JobApplication.find({ userId })
      .populate("jobId", "title")
      .populate("companyId", "name")
      .exec();

    const totalApplications = applications.length;

    const jobsApplied = applications.map(app => ({
      jobTitle: app.jobId?.title || "N/A",
      companyName: app.companyId?.name || "N/A",
      status: app.status
    }));

    return res.json({ 
      success: true, 
      totalApplications, 
      jobsApplied 
    });

  } catch (err) {
    console.error(`Error in getUserApplicationsCount: ${err.message}`);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ success: false, message: "Slug is required" });
    }

    // find by slug
    const user = await User.findOne({ slug })
      .select("-savedJobs -email")   // omit anything you don’t want public
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error("getUserBySlug:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleShowApplications = async (req, res) => {
  try {
    const userId = req.params.userId;            
    const { enabled } = req.body;             

    if (typeof enabled !== "boolean") {
      return res.status(400).json({ success:false, message:"`enabled` must be boolean" });
    }

    await User.findByIdAndUpdate(userId, { showApplications: enabled });
    return res.json({ success: true, showApplications: enabled });
  } catch (err) {
    console.error("toggleShowApplications:", err);
    return res.status(500).json({ success:false, message:"Server error" });
  }
};


export const getActivityGraphBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ success: false, message: "Slug is required" });
    }

    // 1) Lookup user ID by slug
    const user = await User.findOne({ slug }).select("_id").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2) Call the shared logic, not the Express handler
    const graph = await getActivityGraphByRole(user._id, "user");

    return res.json({ success: true, graph });
  } catch (err) {
    console.error("getActivityGraphBySlug:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserApplicationsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res
        .status(400)
        .json({ success: false, message: "Slug is required" });
    }

    // 1) Look up the user by slug
      const user = await User.findOne({ slug }).select("_id showApplications").lean();
    if (!user) return res.status(404).json({ success:false, message:"User not found" });

    if (!user.showApplications) {
      // Stranger requests get an empty list (or you could 403)
      return res.json({ success: true, applications: [] });
    }

    // 2) Query applications for that userId
    const applications = await JobApplication.find({
      userId: user._id,
      jobId: { $ne: null },
    })
      .populate("companyId", "name email image")
      .populate("jobId", "title description category location salary")
      .exec();

    // 3) Return
    return res.json({ success: true, applications });
  } catch (err) {
    console.error("getUserApplicationsBySlug:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error" });
  }
};

export const razorPayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const paymentRazorPay = async (req, res) => {
    try {
      const { userId, planId } = req.body;
  
      if (!userId || !planId) {
        return res.json({ success: false, message: "Missing Details" });
      }
  
      const userData = await User.findById(userId);
      if (!userData) {
        return res.json({ success: false, message: "User not found" });
      }
  
      let durationInMonths, plan, amount;
  
      switch (planId) {
        case 'Monthly':
          plan = 'Monthly';
          durationInMonths = 1;
          amount = 3000;
          break;
  
        case 'Quarterly':
          plan = 'Quarterly';
          durationInMonths = 3;
          amount = 8000;
          break;
  
        case 'Yearly':
          plan = 'Yearly';
          durationInMonths = 12;
          amount = 20000;
          break;
  
        default:
          return res.json({ success: false, message: "Plan Not Found" });
      }
  
      const date = Date.now();
  
      const transactionData = {
        userId,
        plan,
        amount,
        durationInMonths,
        date,
      };
  
      const newTransaction = await transactionModel.create(transactionData);
  
      const options = {
        amount: amount * 100, // amount in paise
        currency: process.env.CURRENCY,
        receipt: newTransaction._id.toString(),
      };
  
      razorPayInstance.orders.create(options, (error, order) => {
        if (error) {
          console.log(`Error in Razorpay order: ${error}`);
          return res.json({ success: false, message: error });
        }
        return res.json({ success: true, order });
      });
  
    } catch (err) {
      console.log(`Error in Razorpay payment: ${err}`);
      return res.status(500).json({ success: false, message: "Payment Failed", error: err.message });
    }
  };

 export const verifyRazorPay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorPayInstance.orders.fetch(razorpay_order_id);

    if (!orderInfo || !orderInfo.receipt) {
      return res.json({ success: false, message: "Invalid Order Info" });
    }

    const transactionData = await transactionModel.findById(orderInfo.receipt);
    if (!transactionData) {
      return res.json({ success: false, message: "Transaction not found" });
    }

    if (transactionData.payment) {
      return res.json({ success: false, message: "Payment Already Processed" });
    }

    const userData = await User.findById(transactionData.userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    // Calculate proExpiresAt
    const transactionDate = new Date(transactionData.date);
    const expiresAt = new Date(transactionDate);
    expiresAt.setMonth(expiresAt.getMonth() + transactionData.durationInMonths);

    // Update user's pro status
    await User.findByIdAndUpdate(userData._id, {
      isPro: true,
      proExpiresAt: expiresAt,
    });

    // Mark payment as completed
    await transactionModel.findByIdAndUpdate(transactionData._id, {
      payment: true,
    });

    return res.json({ success: true, message: "Pro Status Updated" });

  } catch (err) {
    console.error(`Error in verifyRazorPay: ${err}`);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// Save a job
export const saveJob = async (req, res) => {
  try {
    const userId = req.params.id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    await User.findByIdAndUpdate(userId, { $addToSet: { savedJobs: jobId } });

    return res.json({ success: true, message: "Job saved successfully" });
  } catch (err) {
    console.error(`Error in saveJob: ${err.message}`);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Unsave a job
export const unsaveJob = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    await User.findByIdAndUpdate(userId, { $pull: { savedJobs: jobId } });

    return res.json({ success: true, message: "Job unsaved successfully" });
  } catch (err) {
    console.error(`Error in unsaveJob: ${err.message}`);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all saved jobs for a user
export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).populate({
      path: "savedJobs",
      populate: { path: "companyId", select: "-password" },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, savedJobs: user.savedJobs });
  } catch (err) {
    console.error(`Error in getSavedJobs: ${err.message}`);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

async function uploadImageBuffer(buffer, folder = "blogs") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export const createUserBlog = async (req, res) => {
  const userId = req.auth.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  // multer + memoryStorage => req.file.buffer exists
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Image file is required" });
  }

  try {
    const uploadResult = await uploadImageBuffer(req.file.buffer);

    const newBlog = await prisma.blog.create({
      data: {
        title:   req.body.title,
        content: req.body.content,
        image:   uploadResult.secure_url,
        userId,
        companyId: null,
      },
    });

    await logUserActivity(userId, "create_blog");

    res.status(201).json({ success: true, blog: newBlog });
  } catch (err) {
    console.error("Error creating user blog:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateUserBlog = async (req, res) => {
  const userId = req.auth.userId;
  const blogId = req.params.id;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const existing = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    let imageUrl = existing.image;
    if (req.file) {
      // only re-upload if there's a new file
      const uploadResult = await uploadImageBuffer(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    const updated = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title:   req.body.title  ?? existing.title,
        content: req.body.content ?? existing.content,
        image:   imageUrl,
      },
    });

    await logUserActivity(userId, "update_blog");
    res.json({ success: true, blog: updated });
  } catch (err) {
    console.error("Error updating user blog:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteUserBlog = async (req, res) => {
  const userId = req.auth.userId;
  const blogId = req.params.id;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const existing = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // delete comments first if you have that relation
    await prisma.comment.deleteMany({ where: { blogId } });
    await prisma.blog.delete({ where: { id: blogId } });

    await logUserActivity(userId, "delete_blog");
    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    console.error("Error deleting user blog:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addComment = async (req, res) => {
  const userId = req.auth.userId; 
  const { blogId } = req.params;
  const { content, rating } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        rating: rating || null,
        userId,
        companyId: null,
        blogId,
      },
    });

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateComment = async (req, res) => {
  const userId = req.auth.userId;
  const { commentId } = req.params;
  const { content, rating } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment || comment.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        rating: rating ?? comment.rating,
      },
    });

    res.json({ success: true, comment: updatedComment });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteComment = async (req, res) => {
  const userId = req.auth.userId;
  const { commentId } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment || comment.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    
    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });

    const companyIds = blogs.map(b => b.companyId).filter(Boolean);
    const userIds = blogs.map(b => b.userId).filter(Boolean);
    
    const companies = await Company.find({ _id: { $in: companyIds } });
    const users = await User.find({ _id: { $in: userIds } });
    const enrichedBlogs = blogs.map(blog => {
    const company = companies.find(c => c._id.toString() === blog.companyId);
    const user = users.find(u => u._id.toString() === blog.userId);

      let author = null;
      
      if (company) {
        author = { type: "company", ...company.toObject() };
      } else if (user) {
        author = { type: "user", ...user.toObject() };
      }
      

      return {
        ...blog,
        author,
      };
    });

    res.json({ success: true, blogs: enrichedBlogs });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserBlogsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res
        .status(400)
        .json({ success: false, message: "Slug is required" });
    }

    // 1) Lookup the user by slug
    const user = await User.findOne({ slug }).select("_id").lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2) Query Prisma for blogs by that userId
    const blogs = await prisma.blog.findMany({
      where: { userId: user._id },
      orderBy: { createdAt: "desc" },
      include: {
        comments: true,    // or leave out/include fields as you wish
      },
    });

    // 3) Return
    return res.json({ success: true, blogs });
  } catch (err) {
    console.error("getUserBlogsBySlug:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { skills, education, experience, achievements } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(userId, {
      skills,
      education,
      experience,
      achievements
    }, { new: true });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

export const parseAndUpdateProfileFromResume = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user || !user.resume) {
      return res.status(404).json({ 
        success: false, 
        message: "No resume URL found for this user" 
      });
    }

    const parsed = await parseResumeFromUrl(user.resume);
    
    // Update user profile with parsed data
    user.education = parsed.education;
    user.experience = parsed.experience;
    user.projects = parsed.projects;
    user.skills = parsed.skills;
    user.achievements = parsed.achievements;
    
    await user.save();

    res.json({ 
      success: true, 
      message: "Resume parsed and profile updated successfully",
      parsed 
    });
  } catch (err) {
    console.error("Resume parsing error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Resume parsing failed. Please try again." 
    });
  }
};


export const downloadUserApplicationsExcel = async(req, res) => {
   try {
    const userId = req.params.id;
    const applications = await JobApplication.find({ userId })
      .populate("jobId")
      .populate("companyId");

    const data = applications.map(app => ({
      "Company": app.companyId?.name || "N/A",
      "Job Title": app.jobId?.title || "N/A",
      "Location": app.jobId?.location || "N/A",
      "Status": app.status || "N/A",
      "Applied Date": app.date ? new Date(app.date).toLocaleDateString() : "N/A",
      "Interview Date": app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=applications.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: "Excel download failed" });
  }
};


export const getJobRecommendations = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const skills = user.skills || [];
    const education = user.education || [];

    const keywords = [...skills, ...education].filter(Boolean);

    if (keywords.length === 0) {
      return res.json({ success: true, jobs: [] });
    }

    // Build case-insensitive regex array
    const regexArr = keywords.map(k => new RegExp(k, "i"));

    // Find and populate company info
    const jobs = await Job.find({
      $or: [
        { title: { $in: regexArr } },
        { description: { $in: regexArr } },
        { category: { $in: regexArr } },
        { level: { $in: regexArr } }
      ],
      visible: true
    }).populate("companyId", "name email image"); // Only fetch needed company fields

    res.json({ success: true, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Recommendation failed" });
  }
};

