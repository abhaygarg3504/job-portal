// jobController.js 
import Job from "../models/Job.js";

// export const getJobs = async (req, res) => {
//   try {
    
//     const jobs = req.user?.isPro
//   ? await Job.find({}).populate('companyId', '-password')
//   : await Job.find({ visible: true }).populate('companyId', '-password');
  
//   res.json({ success: true, jobs });

//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//     console.log(`error in getJobs is ${err}`);
//   }
// };

export const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = req.user?.isPro ? {} : { visible: true };
    
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('companyId', '-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }), // newest first
      Job.countDocuments(query)
    ]);
    
    res.json({ 
      success: true, 
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasMore: page * limit < total
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
    console.log(`error in getJobs is ${err}`);
  }
};

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

