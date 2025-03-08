import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import  Navbar  from '../components/Navbar'
import { assets } from '../assets/assets';
import kconvert from 'k-convert'
import moment from 'moment'
import JobCard from '../components/JobCard';
import Footer from '../components/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';


const ApplyJob = () => {
  const { id } = useParams();
  const [jobData, setJobData] = useState(null);
  const { jobs, backendURL, userData, userApplications } = useContext(AppContext);

  const navigate = useNavigate()

  const fetchJob = async() => {
    try{
      
    const {data} = await axios.get(backendURL+ `/api/jobs/${id}`)
    if(data.success){
      setJobData(data.job)
    } else{
      toast.error(data.message)
    }
    }
    catch(err){
      toast.error(err.message)
    }
  }

  const applyJobs = async(req, res) =>{
    
    try{
      if(!userData){
      return  toast.error('First Login then apply')
      }

       if(!userData.resume){
        navigate('/application')
        return toast.error('Uploaded Resume for Apply')
       }

    }
    catch(err){
      console.log(`error in applyJobs is ${err}`)
      toast.error(err.message)
    }

  }

  useEffect(() => {
    fetchJob()
  }, [id]);

  return jobData ? (
    <>
     <Navbar/> 
     <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto'>
     <div className='bg-white text-black rounded-lg w-full'>
      <div className='flex justify-center md:justify-between flex-wrap gap-4 px-14 py-20 mb-6 bg-sky-50 border-sky-400 rounded-xl'>
       
        <div className='flex flex-col md:gap-129 md:flex-row items-center'>
          
          <div className=''>
          <img className='h-24 bg-white rounded-lg p-4 mr-4 max:md:mb-4 border' src={jobData.companyId.image} alt="" />
          <div className='text-neutral-700 text-center md:text-left'>
            <h1>{jobData.title}</h1>
            <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2'>
              <span className='flex items-center gap-1'>
                <img src={assets.suitcase_icon} alt="" />
                {jobData.companyId.name}
              </span>
              <span className='flex items-center gap-1'>
                <img src={assets.location_icon} alt="" />
                {jobData.location}
              </span>
              <span className='flex items-center gap-1'>
                <img src={assets.person_icon} alt="" />
                {jobData.level}
              </span>
              <span className='flex items-center gap-1'>
                <img src={assets.money_icon} alt="" />
                CTC: {kconvert.convertTo(jobData.salary)} 
              </span>
            </div>
          </div>
          </div>
          <div className='flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center   '>
            <button onClick={applyJobs} className='bg-blue-600 text-white p-2.5 px-10 rounded'>Apply Now</button>
            <p className='mt-1 text-gray-600'>Posted {moment(jobData.date).fromNow()}</p>
          </div>

        </div>
      </div>

      <div className='flex flex-col lg:flex-row justify-between items-start '>
        <div className='w-full lg:w-2/3'>
          <h2 className='font-bold mb-4 text-2xl'>Job Description</h2>
          <div dangerouslySetInnerHTML={{__html: jobData.description}}></div>
          <button onClick={applyJobs} className='bg-blue-600 text-white p-2.5 px-10 rounded'>Apply Now</button>
        </div>

        {/* Right Section more jobs */}
        <div className='w-full lg:w-1/3 mt-8 lg:mt-0 space-y-5'>
          <h2>More Jobs from {jobData.companyId.name}</h2>
          {jobs
       .filter(job => job._id !== jobData._id && job.companyId._id === jobData.companyId._id) 
       .slice(0, 4) 
       .map((job, index) => (
        <JobCard job={job} key={index} /> 
        ))
        }

        </div>

      </div>

     </div>
     </div>  
     <Footer/>
    </>
  ) : (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-20 h-20 border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin'>
      
      </div>
    </div>
  )
};

export default ApplyJob;
