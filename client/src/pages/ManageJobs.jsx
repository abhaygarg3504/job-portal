import React from 'react'
import moment from "moment"
import {useNavigate} from "react-router-dom"
import { manageJobsData } from '../assets/assets';

const ManageJobs = () => {

  const navigate = useNavigate();

  return (
    <div className='container p-4 max-w-5xl'>
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-200 max-sm:text-sm  '>
        <thead>
          <tr>
            <th className='px-4 py-2 border-b text-left max-sm:hidden'>#</th>
            <th className='px-4 py-2 border-b text-left'>Job Title</th>
            <th className='px-4 py-2 border-b text-left max-sm:hidden'>Date</th>
            <th className='px-4 py-2 border-b text-left max-sm:hidden'>Location</th>
            <th className='px-4 py-2 border-b text-left'>Applicants</th>
            <th className='px-4 py-2 border-b text-left'>Visible</th>
          </tr>
        </thead>
        <tbody>
            {
              manageJobsData.map((job, index)=>(
                <tr className='text-gray-700' key={index}>
                  <td className='px-4 py-2 border-b max-sm:hidden'>{index+1}</td>
                  <td className='px-4 py-2 border-b '>{job.title}</td>
                  <td className='px-4 py-2 border-b max-sm:hidden'>{moment(job.date).format('ll')}</td>
                  <td className='px-4 py-2 border-b max-sm:hidden'>{job.location}</td>
                  <td className='px-4 py-2 border-b text-center'>{job.applicants}</td>
                  <td className='px-4 py-2 border-b'>
                    <input className='scale-125 ml-4' type="checkbox" name="" id="" />
                  </td>

                </tr>
              ))
            }
        </tbody>
        </table>
      </div>
      <div className='mt-4 flex justify-end'>
        <button onClick={()=>navigate('/dashboard/add-job')} className='rounded cursor-pointer bg-black text-gray-50 py-2 px-4'>Add New Job</button>
      </div>
    </div>
  )
}

export default ManageJobs
