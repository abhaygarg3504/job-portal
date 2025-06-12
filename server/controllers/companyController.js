import  Company from "../models/Comapny.js"; 
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Token from "../models/Token.js"; 
import {sendEmail}  from "../utils/sendEmails.js"
import Contact from "../models/Contact.js";
import mongoose from "mongoose"; 
import { PrismaClient } from '@prisma/client';
import User from "../models/User.js";
import { logCompanyActivity } from "../middlewares/activityTrack.js";

const prisma = new PrismaClient();

export const registerCompany= async(req, res) => {
 const {name, email, password} = req.body

 const imagefile = req.file;

 if(!name || !email || !password || !imagefile){
   return res.json({success: false, message: "Missing Details"})
 }

 try{
    const companyexist = await Company.findOne({email})
    if(companyexist){
        return res.json({success: false, message: "Company already Registered"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPasssword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imagefile.path)

    const company = await Company.create({
        name,email,password: hashedPasssword, image: imageUpload.secure_url
    })
     res.json({
       success: true,
       company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image
       },
       token: generateToken(company._id)
    })

 }
 catch(err){
    console.log(`error in registerCompany is ${err}`)
 }
    
}

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
            companyId, // ✅ Corrected
            level,
            category
        });
        await newJob.save();
        await jobQueue.add('newJobPosted', {
          jobId: newJob._id
        })
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
  const { title, content, image } = req.body;
  const companyId = req.company?._id?.toString();

  if (!companyId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        image,
        companyId,
        userId: null, // explicitly set to avoid Prisma error
      },
    });

     await logCompanyActivity(companyId, "create_blog");
    res.status(201).json({ success: true, blog: newBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;
  const companyId = req.company?._id?.toString();

  try {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog || blog.companyId !== companyId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: { title, content, image },
    });
     await logCompanyActivity(companyId, "update_blog");
     // After updating the blog in DB
    res.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const companyId = req.company?._id?.toString();

  try {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog || blog.companyId !== companyId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.comment.deleteMany({ where: { blogId: id } });
    await prisma.blog.delete({ where: { id } });
    await logCompanyActivity(companyId, "delete_blog");    
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
