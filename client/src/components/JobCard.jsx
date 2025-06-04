import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { FaBookmark } from "react-icons/fa";
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
const JobCard = ({job}) => {

  const navigate = useNavigate()
   const {savedJobs,saveJobForUser,unsaveJobForUser} = useContext(AppContext);
   const isSaved = savedJobs.some((j) => j._id === job._id);

  const handleBookmark = () => {
    if (isSaved) unsaveJobForUser(job._id);
    else saveJobForUser(job._id);
  };

  return (
    <div className='border p-6 shadow rounded'>
        <div className='flex justify-between items-center'>
        <img className='h-8' src={job.companyId.image } alt="" />
        <FaBookmark
          onClick={handleBookmark}
          className={`cursor-pointer text-xl ${isSaved ? "text-blue-600" : "text-gray-400"}`}
        />
        </div>
        <h4 className='font-medium text-xl mt-2'>
          {job.title}</h4>
        <div className='flex items-center gap-3 mt-2 text-xs'>
            <span className='bg-blue-50 border border-blue-200 px-4 py-1.5 rounded'>{job.location}</span>
            <span className='bg-blue-50 border border-blue-200 px-4 py-1.5 rounded'>{job.level}</span>
        </div>
        <p className='text-sm mt-4 text-gray-500' dangerouslySetInnerHTML={{__html: job.description.slice(0,150)}}></p>
        <div className='mt-4 flex gap-4 text-sm '>
          <button onClick={()=> navigate(`/apply-job/${job._id}`)} className='bg-blue-600 text-white rounded px-4 py-2'>Apply Now</button>
          <button onClick={()=> navigate(`/apply-job/${job._id}`)} className='bg-white text-blue-700 border border-blue-700 rounded px-4 py-2'>Learn More</button>
        </div>
    </div>
  )
}

export default JobCard
