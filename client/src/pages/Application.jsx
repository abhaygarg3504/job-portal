import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { assets, jobsApplied } from '../assets/assets';
import moment from 'moment';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Application = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);

  const { backendURL, totalJobs, applyJobs, userData, userApplications, 
    fetchUserData,fetchUserApplicationData } = useContext(AppContext);

  const updateResume = async () => {
    try {
        if (!resume) {
            toast.error("Please select a resume file");
            return;
        }

        const formData = new FormData();
        formData.append('resume', resume);
        const token = await getToken();
        const userId = user?.id; 

        if (!userId) {
            toast.error("User ID not found");
            return;
        }

        const { data } = await axios.post(
            `${backendURL}/api/users/update-resume/${userId}`, 
            formData,
            { headers: { Authorization: `Bearer ${token}`,
              // 'Content-Type': 'multipart/form-data',
             } }
        );

        if (data.success) {
            toast.success(data.message);
            await fetchUserData(); 
        } else {
            toast.error(data.message);
        }
    } catch (err) {
        toast.error(err.message);
        console.error(`Error in update-resume: ${err}`);
    }

    setIsEdit(false);
    setResume(null);
  };

  useEffect(()=>{
   if(user){
    fetchUserApplicationData()
   }
  },[user])

  return (
    <>
      <Navbar />
      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
        
        {/* i want to add user details that how much job be applied out of how much total applicants
        there on job-portal website and mention them there are prob members are not
        if there are pro memebers then there image is get small block with text pro with some stylish
        takes user from above 
        
        i want UI like take rectangle box with normal box and in left side there is circle
        of image of user which is fetch from above data
        next side there is user name, user email
        if isPro is true then image top-right side part is write pro is some stylish backend
        if isPro false don't write anything remain same 
         now next part make a make a chart that there is cirlce 
         inside it there is appyjobs/ total jobs in stylsh way
        
        */}
         <div>
<div className="bg-white rounded-lg shadow-md p-6 mb-10 flex items-center gap-6">
  {/* Profile Picture with PRO Badge */}
  <div className="relative">
    <img
      src={userData?.image}
      alt="Profile"
      className="w-24 h-24 rounded-full object-cover border-4 border-gray-300"
    />
    {userData?.isPro && (
      <span className="absolute top-0 right-0 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full shadow-md font-semibold">
        PRO
      </span>
    )}
  </div>

  {/* User Info and Stats */}
  <div className="flex-1">
    <h2 className="text-2xl font-bold">{userData?.name}</h2>
    <p className="text-gray-600">{userData?.email}</p>

    {/* Application Progress */}
    <div className="mt-4 flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            strokeWidth="4"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-blue-500"
            strokeWidth="4"
            strokeDasharray={`${(applyJobs.length / totalJobs.length) * 100}, 100`}
            stroke="currentColor"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">
            {applyJobs}/{totalJobs}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Jobs Applied
      </p>
    </div>
  </div>
</div>

         </div>
        
        <h2 className='text-xl font-semibold'>Your Resume</h2>

        <div className='flex gap-2 mb-6 mt-3'>
          {isEdit || (userData && !userData.resume) ? (
            <>
              <label className='flex items-center' htmlFor="resumeUpload">
                <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>
                  {resume ? resume.name : "Select Resume"}
                </p>
                <input
                  id='resumeUpload'
                  onChange={e => setResume(e.target.files[0])}
                  type="file"
                  hidden
                  accept='application/pdf'
                />
                <img src={assets.profile_upload_icon} alt="Upload Icon" />
              </label>
              <button
                onClick={updateResume}
                className='bg-green-100 border border-green-400 rounded-lg px-4 py-2'
              >
                Save
              </button>
            </>
          ) : (
            <div className='flex gap-2'>
              <a 
                className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg' 
                href={userData?.resume || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Resume
              </a>
              <button
                onClick={() => setIsEdit(true)}
                className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2'
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <h2 className='text-xl font-semibold mb-4'>Jobs Applied</h2>

        <table className='min-w-full bg-white border rounded-lg'>
          <thead>
            <tr>
              <th className='py-3 px-4 border-b text-left'>Company</th>
              <th className='py-3 px-4 border-b text-left'>Job Title</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Location</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-3 px-4 border-b text-left'>Status</th>
            </tr>
          </thead>
          <tbody>
            {userApplications.map((job, index) => (
              <tr key={index}>
                <td className='py-2 px-2 flex items-center gap-2 border-b'>
                  <img className='w-8 h-8' src={job.companyId.image} alt={job.company} />
                  {job.companyId.name}
                </td>
                <td className='py-2 px-4 border-b'>{job.jobId.title}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{job.jobId.location}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.date).format('ll')}</td>
                <td className='py-2 px-4 border-b'>
                  <span className={`${job.status === 'Accepted' ? 'bg-green-200' : job.status === 'Rejected' ? 'bg-red-200' : 'bg-blue-200'} px-4 py-1.5 rounded`}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
};

export default Application;
