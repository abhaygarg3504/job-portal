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

export const getJobById = async(req, res)=> {
   try{
    const { id } = req.params
    const job = await Job.findById(id).populate({path: 'companyId', select: '-password'})
    if(job){res.json({success: true,job})}
    else{res.json({success: false,message: "Job not found" })}}
   catch(err){
    console.log(`Error in getJobby id is ${err}`)
   }
}

export const getJobCount = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments(); // counts all jobs
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


