import  Company from "../models/Comapny.js"; 
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Token from "../models/Token.js"; 
import slugify from "slugify"; 
import {sendEmail}  from "../utils/sendEmails.js"
import Contact from "../models/Contact.js";
import mongoose from "mongoose"; 
import { PrismaClient } from '@prisma/client';
import User from "../models/User.js";
import { logCompanyActivity } from "../middlewares/activityTrack.js";
import XLSX from "xlsx";
import { getActivityGraphByRole } from "./activityController.js";
const prisma = new PrismaClient();

async function uploadImageBuffer(buffer, folder = "blogs") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export const registerCompany = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || !req.file || !req.file.buffer) {
    return res
      .status(400)
      .json({ success: false, message: "Name, email, password and image are required" });
  }

  try {
    const exists = await Company.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Company already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const uploadResult = await uploadImageBuffer(req.file.buffer, "company_logos");

    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      image: uploadResult.secure_url,
    });

    const payload = {
      _id: company._id,
      name: company.name,
      email: company.email,
      image: company.image,
    };

    return res.status(201).json({
      success: true,
      company: payload,
      token: generateToken(company._id),
    });
  } catch (err) {
    console.error("Error in registerCompany:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const loginCompany = async (req, res) => {
    const { email, password } = req.body;
    try {
        const company = await Company.findOne({ email });

        if (!company) {
            return res.json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, company.password);
        if (isMatch) {
        
            res.json({
                success: true,
                message: "Login Successfully",
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id)
            });
        } else {
            res.json({
                success: false,
                message: "Invalid email or password"
            });
        }

    } catch (err) {
        console.error(`Error in loginCompany: ${err}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getCompanyData = async (req, res) => {
    try {
        if (!req.company || !req.company._id) {
            return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
        }

        // ✅ Fetch company details from the database
        const company = await Company.findById(req.company._id).select("-password");

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.json({ success: true, company });
    } catch (err) {
        console.error(`Error in getCompanyData: ${err.message}`);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getCompanyDataBySlug = async(req, res) => {
  try {
    const {slug} = req.params;
     if (!slug) {
      return res.status(400).json({ success: false, message: "Slug is required" });
    }

    const company = await Company.findOne({slug}).select("-password")

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    return res.json({ success: true, company });
    
  } catch (error) {
    console.error(`error in getcompanydatabySlug `, error.message)
    res.json({success: false, message:error.message || "Internal Server Error"})
  }
};

export const getCompanyActivityGraphBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ success: false, message: "Slug is required" });
    }

    // 1) Lookup user ID by slug
    const company = await Company.findOne({ slug }).select("_id").lean();
    if (!company) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2) Call the shared logic, not the Express handler
    const graph = await getActivityGraphByRole(company._id, "company");

    return res.json({ success: true, graph });
  } catch (err) {
    console.error("getCompanyActivityGraphBySlug:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCompanyBlogsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res
        .status(400)
        .json({ success: false, message: "Slug is required" });
    }

    // 1) Lookup the user by slug
    const company = await Company.findOne({ slug }).select("_id password").lean();
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2) Query Prisma for blogs by that userId
    const blogs = await prisma.blog.findMany({
      where: { companyId: company._id },
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

export const postJob = async (req, res) => {
    if (!req.company) {
        return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    const { title, description, location, salary, level, category } = req.body;
    const companyId = req.company._id ? req.company._id.toString() : null;

    if (!companyId) {
        return res.status(400).json({ success: false, message: "Company ID is missing" });
    }

    try {
        const newJob = new Job({
            title,
            description,
            location,
            salary,
            companyId,
            level,
            category
        });
        await newJob.save();
        // Remove this line:
        // await jobQueue.add('newJobPosted', { jobId: newJob._id })
        
        await logCompanyActivity(companyId, "post_job");
        res.json({ success: true, newJob });
    } catch (err) {
        console.log(`Error in postJob: ${err}`);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getCompanyJobApplicants = async (req, res) => {
    try {
        const companyId = req.company?._id; // Ensure company ID exists
        if (!companyId) {
            return res.status(400).json({ success: false, message: "Unauthorized access" });
        }

        // Fetch job applications
        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name image resume')
            .populate('jobId', 'title location category level salary') // Corrected field names
            .exec();

        return res.json({ success: true, applicants: applications });

    } catch (err) {
        console.error(`Error in getCompanyJobApplicants: ${err}`);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getCompanyPostedJobs = async (req, res) => {
    try {
      const companyId = req.company._id;
      
      const jobs = await Job.find({ companyId }).lean();
      const jobsWithApplicants = await Promise.all(
        jobs.map(async (job) => {
          const applicantsCount = await JobApplication.countDocuments({ jobId: job._id });
          return { ...job, applicants: applicantsCount };
        })
      );
  
      res.json({ success: true, jobs: jobsWithApplicants });
    } catch (err) {
      console.error(`Error in getCompanyPostedJobs: ${err.message}`);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
  
export const changeJobApplicationStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("userId", "email name")
      .populate("companyId", "name")
      .populate("jobId", "title");

    if (!updatedApplication) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const userEmail = updatedApplication.userId.email;
    const userName = updatedApplication.userId.name;
    const companyName = updatedApplication.companyId.name;
    const jobTitle = updatedApplication.jobId.title;
    const currentStatus = updatedApplication.status;
    const companyId = updatedApplication.companyId

    // ✅ Create contact if status is accepted
    if (currentStatus.toLowerCase() === "accepted") {
      const existingContact = await Contact.findOne({
        userId: updatedApplication.userId._id,
        recruiterId: updatedApplication.companyId._id,
        jobTitle,
      });

      if (!existingContact) {
        const newContact = new Contact({
          userId: updatedApplication.userId._id,
          recruiterId: updatedApplication.companyId._id,
          userName,
          companyName,
          jobTitle,
        });

        await newContact.save();

      }
    }

    // Send email
    await sendEmail(
      userEmail,
      `Application Status Update: ${jobTitle} at ${companyName}`,
      `<p>Dear ${userName},</p>
       <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to:
       <strong>${currentStatus}</strong>.</p>
       <p>Thank you for applying!</p>`
    );
    await logCompanyActivity(companyId, "change_jobapplication_status");


    res.json({
      success: true,
      message: "Status Updated",
      application: updatedApplication,
      userEmail,
      userName,
      companyName,
      jobTitle,
      currentStatus
    });
  } catch (err) {
    console.error(`Error in changeJobApplicationStatus: ${err}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const changeJobVisibility = async (req, res) => {
  try {
    const { id, visible } = req.body;
    const companyId = req.company._id;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (companyId.toString() !== job.companyId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this job" });
    }

    job.visible = visible; // set from request
    await job.save();
    await logCompanyActivity(id, "change_visiblity");

    res.json({ success: true, job, message: `Job visibility changed to ${visible}` });
  } catch (err) {
    console.error(`Error in visibility toggle: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const setUpOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await Company.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Token.findOneAndDelete({ email }); // remove any existing OTPs

    await Token.create({ email, otp });

    // Use sendEmail here:
    await sendEmail(email, "Password Reset OTP", `Your OTP is: <strong>${otp}</strong>`);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in setUpOTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const validToken = await Token.findOne({ email, otp });

        if (!validToken) return res.status(400).json({ message: "Invalid or expired OTP" });

        res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        console.error("Error in verifyOTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Company.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        await Token.deleteMany({ email }); // clean up OTP

        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const setInterviewDate = async (req, res) => {
  try {
    const { id, interviewDate } = req.body;

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { interviewDate: new Date(interviewDate) },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
     await logCompanyActivity(id, "set_interview_date");

    res.json({
      success: true,
      message: "Interview date set successfully",
      application
    });
  } catch (err) {
    console.error("Error in setInterviewDate:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getInterviewDetails = async (req, res) => {
  try {
    const { userId, companyId } = req.query;

    if (!userId && !companyId) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId or companyId.",
      });
    }

    const filter = { interviewDate: { $ne: null } };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      filter.companyId = new mongoose.Types.ObjectId(companyId);
    }

    const applications = await JobApplication.find(filter)
      .populate("userId", "name")
      .populate("companyId", "name")
      .populate("jobId", "title")
      .select("interviewDate userId companyId jobId");

    const interviews = applications.map((app) => ({
      interviewDate: app.interviewDate,
      userName: app.userId?.name,
      companyName: app.companyId?.name,
      jobTitle: app.jobId?.title,
    }));

    return res.status(200).json({
      success: true,
      interviews,
    });

  } catch (error) {
    console.error("Error fetching interview details:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createBlog = async (req, res) => {
  const companyId = req.company?._id?.toString();
  if (!companyId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { title, content } = req.body;
  if (!req.file || !req.file.buffer) {
    return res
      .status(400)
      .json({ success: false, message: "Image file is required" });
  }

  try {
    const uploadResult = await uploadImageBuffer(req.file.buffer, "company_blogs");
    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        image: uploadResult.secure_url,
        companyId,
        userId: null,
      },
    });

    await logCompanyActivity(companyId, "create_blog");
    return res.status(201).json({ success: true, blog: newBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const updateBlog = async (req, res) => {
  const companyId = req.company?._id?.toString();
  const blogId = req.params.id;
  if (!companyId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const existing = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!existing || existing.companyId !== companyId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    let imageUrl = existing.image;
    if (req.file && req.file.buffer) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, "company_blogs");
      imageUrl = uploadResult.secure_url;
    }

    const updated = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title: req.body.title   ?? existing.title,
        content: req.body.content ?? existing.content,
        image: imageUrl,
      },
    });

    await logCompanyActivity(companyId, "update_blog");
    return res.json({ success: true, blog: updated });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteBlog = async (req, res) => {
  const companyId = req.company?._id?.toString();
  const blogId = req.params.id;
  if (!companyId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const existing = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!existing || existing.companyId !== companyId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.comment.deleteMany({ where: { blogId } });
    await prisma.blog.delete({ where: { id: blogId } });
    await logCompanyActivity(companyId, "delete_blog");
    return res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getBlogComments = async (req, res) => {
  const { blogId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { blogId },
      orderBy: { createdAt: "desc" },
    });

    const companyIds = comments.map(c => c.companyId).filter(Boolean);
    const userIds = comments.map(c => c.userId).filter(Boolean);

    // Fetch company and user documents
    const companies = await Company.find({ _id: { $in: companyIds } });
    const users = await User.find({ _id: { $in: userIds } });

    const enrichedComments = comments.map(comment => {
      const company = companies.find(c => c._id.toString() === comment.companyId);
      const user = users.find(u => u._id.toString() === comment.userId);

      let author = null;
      if (company) {
        author = { type: "company", ...company.toObject() };
      } else if (user) {
        author = { type: "user", ...user.toObject() }; 
      }


      return {
        ...comment,
        author,
      };
    });

    

    res.json({ success: true, comments: enrichedComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addCompanyComment = async (req, res) => {
  const companyId = req.company?._id?.toString(); 
  const { blogId } = req.params;
  const { content, rating } = req.body;

  if (!companyId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // Check if blog exists
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        rating: rating || null,
        blogId,
        companyId,
        userId: null, 
      },
    });

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error("Error adding company comment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCompanyComment = async (req, res) => {
  const companyId = req.company?._id?.toString();
  const { commentId } = req.params;
  const { content, rating } = req.body;

  if (!companyId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment || comment.companyId !== companyId) {
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
    console.error("Error updating company comment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteCompanyComment = async (req, res) => {
  const companyId = req.company?._id?.toString();
  const { commentId } = req.params;

  if (!companyId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment || comment.companyId !== companyId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting company comment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const deleteJob = async (req, res) => {
  try {
   const { id } = req.params;

    const deletedJob = await Job.findByIdAndDelete(id);
    if (!deletedJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    await JobApplication.deleteMany({ jobId: id });

    res.json({ success: true, message: "Job and related applications deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const uploadJobsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const companyId = req.company._id;
    const timestamp = Date.now();
    const publicId = `jobs_excel_${companyId}_${timestamp}.xlsx`;

    // Upload Excel to Cloudinary with a specific public_id
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "job_excels",
          public_id: publicId,
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    if (!uploadResult?.secure_url) {
      return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
    }

    // Parse Excel from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const jobsData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Prepare jobs for insertion
    const jobsToInsert = jobsData.map(job => ({
      title: job.title || "N/A",
      description: job.description || "N/A",
      location: job.location || "N/A",
      category: job.category || "N/A",
      level: job.level || "N/A",
      salary: job.salary ? Number(job.salary) : 0,
      date: job.date ? new Date(job.date) : Date.now(),
      visible: job.visible !== undefined ? Boolean(job.visible) : true,
      companyId,
    }));

    // Insert jobs
    await Job.insertMany(jobsToInsert);

    res.json({
      success: true,
      message: "Excel uploaded to Cloudinary and jobs posted",
      cloudinaryUrl: uploadResult.secure_url,
      jobsPosted: jobsToInsert.length,
    });
  } catch (err) {
    console.error("Error in uploadJobsExcel:", err);
    res.status(500).json({ success: false, message: "Bulk job upload failed" });
  }
};

export const downloadCompanyApplicationsExcel = async (req, res) => {
  try {
    const companyId = req.company._id; 
    const applications = await JobApplication.find({ companyId })
      .populate("jobId")
      .populate("userId");

    const data = applications.map(app => ({
      "Username": app.userId?.name || "N/A",
      "Job Title": app.jobId?.title || "N/A",
      "Applied Date": app.date ? new Date(app.date).toLocaleDateString() : "N/A",
      "Interview Date": app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=company_applications.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: "Excel download failed" });
  }
};
