import Job from "../models/Job.js";

// get all jobs
export const getJobs = async(req, res) => {
    try{

        const jobs = await Job.find({visible: true})
        .populate({path: 'companyId', select: '-password'})
        
        res.json({
            success: true,
            jobs
        })

    }
    catch(err){
        res.json({
            success: false,
            messgae: err.messgae
        })
        console.log(`error in getJobs is ${err}`)
    }

}

// get job by single Id
export const getJobById = async(req, res)=> {

   try{
    const { id } = req.params
    const job = await Job.findById(id).populate({path: 'companyId', select: '-password'})
    if(job){
        res.json({
            success: true,
            job
        })
    }
    else{
        res.json({
            success: false,
            message: "Job not found"
        })
    }
   }
   catch(err){
    console.log(`Error in getJobby id is ${err}`)
   }

}
