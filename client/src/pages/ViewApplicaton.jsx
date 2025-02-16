import React from 'react'
import { assets, viewApplicationsPageData } from '../assets/assets'

function ViewApplicaton() {
  return (
    <div className='container mx-auto p-3'>
      <div >
<table className="w-full max-w-4xl bg-white border border-gray-200 table-fixed max-sm:text-sm">
  <thead>
    <tr className="border-b">
      <th className="w-1/6 px-4 py-2">#</th>
      <th className="w-1/6 px-4 py-2">Username</th>
      <th className="w-1/6 px-4  max-sm:hidden py-2">Job Title</th>
      <th className="w-1/6 px-4  max-sm:hidden py-2">Location</th>
      <th className="w-1/6 px-4 py-2">Resume</th>
      <th className="w-1/6 px-4 py-2">Action</th>
    </tr>
  </thead>
          <tbody>
              {
                viewApplicationsPageData.map((person, index)=>(
                  <tr key={index} className='text-gray-700'>
                    <td className='py-2 px-4 border-b text-center'>{index+1}</td>
                  <td className='py-2 px-4 border-b text-center flex'>
                    <img className='w-10 h-10 rounded-full mr-3 max-sm:hidden' src={person.imgSrc} alt="" />
                    <span>{person.name}</span>
                  </td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{person.jobTitle}</td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{person.location}</td>
                  <td className='py-2 px-4 border-b '>
                    <a href="" target='_blank'
                    className='bg-blue-50 text-blue-400 px-3 py-1 rounded inline-flex gap-2 items-center'
                    >Resume <img src={assets.resume_download_icon} alt="" />  
                    </a>
                  </td>
                  <td className='py-2 px-4 border-b relative'>
                    <div className='relative inline-block text-left group'>
                      <button className='text-gray-500 action-button'>...</button>
                      <div className='z-10 absolute hidden right-0 top-0 mt-2 w-32 bg-white border md:left-0 border-gray-200 rounded shadow group-hover:block'>
                        <button className='block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100 '>Accept</button>
                        <button className='block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 '>Reject</button>
                      </div>
                    </div>
                  </td>

                  </tr>
                ))
              }
              
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ViewApplicaton
