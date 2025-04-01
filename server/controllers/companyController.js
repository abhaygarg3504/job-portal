import Company from "../models/Comapny.js";
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

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
    // console.log("Company from Request:", req.company); // 🛠 Debugging Step

    if (!req.company) {
        return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    const { title, description, location, salary, level, category } = req.body;

    // ✅ Ensure companyId is correctly assigned
    const companyId = req.company._id ? req.company._id.toString() : null;
    // console.log("Extracted companyId:", companyId); // 🛠 Debugging Step

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

        // console.log("New Job Data Before Saving:", newJob); // 🛠 Debugging Step

        await newJob.save();
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
      
      // Fetch jobs and convert to plain objects for better performance
      const jobs = await Job.find({ companyId }).lean();
  
      // Adding the number of applicants to job data
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
        { new: true } // Returns the updated document
      );
  
      if (!updatedApplication) {
        return res.status(404).json({ success: false, message: "Application not found" });
      }
  
      res.json({ success: true, message: "Status Updated", application: updatedApplication });
    } catch (err) {
      console.error(`Error in changeJobApplicationStatus: ${err}`);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
export const changeJobVisibility = async (req, res) => {
    try {
        const { id } = req.body;
        const companyId = req.company._id;

        // ✅ Check if job exists
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // ✅ Ensure only the owner company can change visibility
        if (companyId.toString() !== job.companyId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this job" });
        }

        // ✅ Toggle visibility
        job.visible = !job.visible; 
        await job.save();

        res.json({ success: true, job });
    } catch (err) {
        console.error(`Error in visibility toggle: ${err.message}`);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

