import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import Footer from '../components/Footer';
import kconvert from 'k-convert';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth, useUser } from '@clerk/clerk-react';
import { assets } from '../assets/assets';

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, backendURL, userData, userApplications, fetchUserApplicationData } = useContext(AppContext);
  const { getToken } = useAuth();
  const { user } = useUser();

  const [jobData, setJobData] = useState(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

  // 1. Fetch the job by ID
  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/jobs/${id}`);
      if (data.success) {
        setJobData(data.job);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 2. Check whether the user has already applied
  useEffect(() => {
    if (jobData && userApplications.length > 0) {
      const hasApplied = userApplications.some(app => app.jobId?._id === jobData._id);
      setIsAlreadyApplied(hasApplied);
    }
  }, [jobData, userApplications]);

  // 3. Apply handler: no-op if already applied
  const applyJobs = async () => {
    if (isAlreadyApplied) return;                    // <<–– guard!
    if (!userData) {
      toast.error('Please log in before applying.');
      return;
    }
    if (!userData.resume) {
      navigate('/application');
      toast.error('Please upload your resume to apply.');
      return;
    }

    try {
      const token = await getToken();
      const userId = user?.id;
      if (!userId) {
        toast.error('User ID not found.');
        return;
      }

      const { data } = await axios.post(
        `${backendURL}/api/users/apply/${userId}`,
        { jobId: jobData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUserApplicationData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  // 4. Render
  if (!jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col py-10 container mx-auto px-4 2xl:px-20">
        <div className="bg-white text-black rounded-lg w-full">
          {/* Job Header */}
          <div className="flex justify-between flex-wrap gap-4 px-14 py-20 mb-6 bg-sky-50 border-sky-400 rounded-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <img
                className="h-24 bg-white rounded-lg p-4 border"
                src={jobData.companyId.image}
                alt={jobData.companyId.name}
              />
              <div className="text-neutral-700">
                <h1 className="text-2xl font-bold">{jobData.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mt-2">
                  <span className="flex items-center gap-1">
                    <img src={assets.suitcase_icon} alt="" />
                    {jobData.companyId.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.location_icon} alt="" />
                    {jobData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.person_icon} alt="" />
                    {jobData.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.money_icon} alt="" />
                    CTC: {kconvert.convertTo(jobData.salary)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <button
                onClick={applyJobs}
                disabled={isAlreadyApplied}
                className={`p-2.5 px-10 rounded ${
                  isAlreadyApplied ? 'bg-blue-700 text-white cursor-not-allowed' : 'bg-blue-600 text-white'
                }`}
              >
                {isAlreadyApplied ? 'Already Applied' : 'Apply Now'}
              </button>
              <p className="mt-1 text-gray-600">
                Posted {moment(jobData.date).fromNow()}
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div className="flex flex-col lg:flex-row justify-between items-start">
            <div className="w-full lg:w-2/3">
              <h2 className="font-bold mb-4 text-2xl">Job Description</h2>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: jobData.description }}
              />
              <button
                onClick={applyJobs}
                disabled={isAlreadyApplied}
                className={`mt-6 p-2.5 px-10 rounded ${
                  isAlreadyApplied ? 'bg-blue-700 text-white cursor-not-allowed' : 'bg-blue-600 text-white'
                }`}
              >
                {isAlreadyApplied ? 'Already Applied' : 'Apply Now'}
              </button>
            </div>

            {/* More Jobs */}
            <div className="w-full lg:w-1/3 mt-8 lg:mt-0 space-y-5">
              <h2>More Jobs from {jobData.companyId.name}</h2>
              {jobs
                    .filter(job =>
      job.companyId._id === jobData.companyId._id &&
      job._id !== jobData._id &&
      !userApplications.some(app => app.jobId?._id === job._id))
                .slice(0, 4)
                .map(job => <JobCard job={job} key={job._id} />)}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ApplyJob;
