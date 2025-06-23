import Job from "../models/Job.js";

export const getJobs = async (req, res) => {
  try {
    // let jobs; 
    // if (req.user && req.user?.isPro) {
    //   jobs = await Job.find({}).populate({ path: 'companyId', select: '-password' });
    // } else {
    //   jobs = await Job.find({ visible: true }).populate({ path: 'companyId', select: '-password' });
    // }
    const jobs = req.user?.isPro
  ? await Job.find({}).populate('companyId', '-password')
  : await Job.find({ visible: true }).populate('companyId', '-password');
  
  res.json({ success: true, jobs });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
    console.log(`error in getJobs is ${err}`);
  }
};



// import Job  from "../models/Job.js";
// import User from "../models/User.js";     // <— make sure you import your User model

// export const getJobs = async (req, res) => {
//   try {
//     // 1) figure out “isPro”:
//     let isPro = false;

//     // a) if you ever populate `req.user` in middleware, use that:
//     if (req.user) {
//       isPro = req.user.isPro;

//     // b) otherwise, if you’re using Clerk, passport, etc., load the user from whatever ID you do have:
//     } else if (req.auth?.userId) {
//       const user = await User.findById(req.auth.userId);
//       if (user) isPro = user.isPro;
//     }

//     // 2) build your filter:
//     const filter = {};
//     if (!isPro) {
//       filter.visible = true;
//     }

//     // 3) run the single query:
//     const jobs = await Job
//       .find(filter)
//       .populate("companyId", "-password");

//     res.json({ success: true, jobs });

//   } catch (err) {
//     console.error("error in getJobs:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const getJobById = async(req, res)=> {
   try{
    const { id } = req.params
    const job = await Job.findById(id).populate({path: 'companyId', select: '-password'})
    if(job){
    
      res.json({success: true,job})}
    else{res.json({success: false,message: "Job not found" })}}
   catch(err){
    console.log(`Error in getJobby id is ${err}`)
   }
}

// controllers/jobController.js
// import Job  from "../models/Job.js";

// export const getJobs = async (req, res) => {
//   try {
//     // req.user will be the loaded User doc (or undefined if not logged in)
//     const isPro = Boolean(req.user?.isPro);

//     const filter = {};
//     if (!isPro) {
//       filter.visible = true;
//     }

//     const jobs = await Job
//       .find(filter)
//       .populate("companyId", "-password");

//     res.json({ success: true, jobs });
//   } catch (err) {
//     console.error("error in getJobs:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getJobById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const job = await Job
//       .findById(id)
//       .populate("companyId", "-password");

//     if (!job) {
//       return res.status(404).json({ success: false, message: "Job not found" });
//     }

//     // Optionally enforce visibility on single‐job fetch too:
//     if (!job.visible && !req.user?.isPro) {
//       return res.status(403).json({ success: false, message: "Members only" });
//     }

//     res.json({ success: true, job });
//   } catch (err) {
//     console.error("Error in getJobById:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
// controllers/jobController.js
// import Job from "../models/Job.js";
// import User from "../models/User.js";

// GET /api/jobs
// export const getJobs = async (req, res) => {
//   try {
//     // 1. Determine isPro
//     let isPro = false;
//     if (req.user) {
//       isPro = !!req.user.isPro;
//     } else if (req.auth?.userId) {
//       const user = await User.findById(req.auth.userId).select("isPro");
//       isPro = user?.isPro || false;
//     }

//     // 2. Build filter
//     const filter = {};
//     if (!isPro) filter.visible = true;

//     // 3. Fetch jobs
//     const jobs = await Job.find(filter)
//       .populate("companyId", "-password")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, jobs });
//   } catch (err) {
//     console.error("error in getJobs:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // GET /api/jobs/:id
// export const getJobById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const job = await Job.findById(id).populate("companyId", "-password");
//     if (!job) {
//       return res.status(404).json({ success: false, message: "Job not found" });
//     }

//     // Check Pro status
//     let isPro = false;
//     if (req.user) {
//       isPro = !!req.user.isPro;
//     } else if (req.auth?.userId) {
//       const user = await User.findById(req.auth.userId).select("isPro");
//       isPro = user?.isPro || false;
//     }

//     // If job is not visible and user is not Pro, forbid
//     if (!job.visible && !isPro) {
//       return res.status(403).json({ success: false, message: "Only Pro members can view this job." });
//     }

//     res.json({ success: true, job });
//   } catch (err) {
//     console.error("error in getJobById:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getJobCount = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments(); 
    res.json({
      success: true,
      totalJobs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching job count",
      error: err.message
    });
  }
};

