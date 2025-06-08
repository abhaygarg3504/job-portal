import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import transactionModel from "../models/transactionModel.js";
import User from "../models/User.js";
import Razorpay from "razorpay"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import Company from "../models/Comapny.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import connectCloudinary from "../config/cloudinary.js";
import { logUserActivity } from "../middlewares/activityTrack.js";
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
        const userId = req.params.id;

        if (!userId) {
            console.log("Can't get user ID");
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // ✅ Find the user in MongoDB
        let userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const resumeUpload = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto", 
            type: 'upload',
            access_mode: 'public'
        });

        userData.resume = resumeUpload.secure_url;
        await userData.save();
        await logUserActivity(userId, "update_resume");


        return res.json({ 
            success: true, 
            message: "Resume Updated Successfully", 
            user: userData  
        });
    } catch (err) {
        console.error(`Error in updateResume: ${err.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// export const updateResume = async (req, res) => {
//     try {
//         const userId = req.params.id;

//         if (!userId) {
//             console.log("Can't get user ID");
//             return res.status(400).json({ success: false, message: "User ID is required" });
//         }
//         let userData = await User.findById(userId);
//         if (!userData) {
//             return res.status(404).json({ success: false, message: "User Not Found" });
//         }

//         if (!req.file) {
//             return res.status(400).json({ success: false, message: "No file uploaded" });
//         }

//         // ✅ Upload resume to Cloudinary
//         // const resourceType = req.file.mimetype === "application/pdf" ? "raw" : "image";

// const resumeUpload = await connectCloudinary.uploader.upload(req.file.path, {
//   resource_type: "raw",
//   folder: "resumes",
// });
//         let finalUrl = resumeUpload.secure_url;

// // If the uploaded file is a PDF, fix the URL path
// if (req.file.mimetype === "application/pdf") {
//   finalUrl = finalUrl.replace("/image/upload/", "/raw/upload/");
// }

// userData.resume = finalUrl;
// await userData.save();

//         return res.json({ 
//             success: true, 
//             message: "Resume Updated Successfully", 
//             user: userData  
//         });
//     } catch (err) {
//         console.error(`Error in updateResume: ${err.message}`);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

// export const updateResume = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     if (!userId) {
//       return res.status(400).json({ success: false, message: "User ID is required" });
//     }

//     const userData = await User.findById(userId);
//     if (!userData) {
//       return res.status(404).json({ success: false, message: "User Not Found" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     const fileExt = path.extname(req.file.originalname); // like .pdf
//     const publicId = `resume_${userId}${fileExt}`;

//     const resumeUpload = await connectCloudinary.uploader.upload(req.file.path, {
//       resource_type: "auto",
//       folder: "resumes",
//       public_id: publicId,
//       use_filename: true,
//       unique_filename: false,
//     });

//     const viewUrl = resumeUpload.secure_url.replace("/upload/", "/upload/fl_inline/");

//     userData.resume = viewUrl;
//     await userData.save();

//     return res.json({
//       success: true,
//       message: "Resume Updated Successfully",
//       user: userData,
//     });
//   } catch (err) {
//     console.error(`Error in updateResume: ${err.message}`);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// export const updateResume = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     const uploadFromBuffer = (fileBuffer) => {
//       return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           {
//             resource_type: "raw", // ensure it's raw
//             folder: "resumes",
//             format: "pdf",
//           },
//           (error, result) => {
//             if (error) return reject(error);
//             resolve(result);
//           }
//         );
//         stream.end(fileBuffer);
//       });
//     };

//     const result = await uploadFromBuffer(req.file.buffer);

//     // Use the secure_url returned by Cloudinary (it is correct even for raw PDFs)
//     const resumeUrl = result.secure_url;

//     await User.findByIdAndUpdate(userId, { resume: resumeUrl });

//     return res.json({ success: true, message: "Resume updated", resume: resumeUrl });
//   } catch (err) {
//     console.error("Resume upload error:", err);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// export const updateResume = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     if (!req.file || !req.file.path) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     const filePath = req.file.path;

//     // Upload to Cloudinary as raw
//     const result = await cloudinary.uploader.upload(filePath, {
//       resource_type: "raw",
//       folder: "resumes",
//     });

//     // Delete local file after upload
//     await fs.unlink(filePath);

//     // Make the URL inline-viewable
//     const resumeUrl = result.secure_url;

//     // Save resume URL in the DB
//     await User.findByIdAndUpdate(userId, { resume: resumeUrl });

//     return res.status(200).json({
//       success: true,
//       message: "Resume uploaded successfully",
//       resume: resumeUrl,
//     });

//   } catch (err) {
//     console.error("Resume upload error:", err);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

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

    // Map to extract only necessary info
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

export const createUserBlog = async (req, res) => {
  const userId = req.auth.userId; 
  
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const newBlog = await prisma.blog.create({
      data: {
        title: req.body.title,
        content: req.body.content,
        image: req.body.image,
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
  const { id } = req.params;
  const { title, content, image } = req.body;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog || blog.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only update your own blog" });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title,
        content,
        image,
      },
    });

    await logUserActivity(userId, "update_blog");

    res.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error("Error updating user blog:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteUserBlog = async (req, res) => {
  const { id } = req.params;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog || blog.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only delete your own blog" });
    }

    // Delete associated comments first (optional for cascade handling)
    await prisma.comment.deleteMany({ where: { blogId: id } });

    await prisma.blog.delete({ where: { id } });
    await logUserActivity(userId, "delete_blog");

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting user blog:", error);
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
