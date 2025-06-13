import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const { backendURL, companyToken } = useContext(AppContext);

  const fetchCompanyJobs = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/company/list-jobs`, {
        headers: { Authorization: `Bearer ${companyToken}` },
      });

      if (data.success && Array.isArray(data.jobs)) {
        setJobs([...data.jobs].reverse());
      } else {
        toast.error(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'An error occurred');
    }
  };
  const deleteJobHandler = async (id) => {
  if (!window.confirm('Are you sure you want to delete this job?')) return;

  try {
    const { data } = await axios.delete(`${backendURL}/api/company/delete/${id}`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    });

    if (data.success) {
      toast.success('Job deleted successfully!');
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== id));
    } else {
      toast.error(data.message || 'Failed to delete job');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Something went wrong');
  }
};

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs();
    }
  }, [companyToken]);

  const changeJobVisibility = async (id, currentVisibility) => {
    try {
      const newVisibility = !currentVisibility; 
      const { data } = await axios.post(
        `${backendURL}/api/company/change-visibility`,
        { id, visible: newVisibility },
        { headers: { Authorization: `Bearer ${companyToken}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setJobs((prevJobs) =>
          prevJobs.map((job) => job._id === id ? { ...job, visible: newVisibility } : job));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return jobs ? (
    jobs.length === 0 ? (
      <div>No Job Listings Posted</div>
    ) : (
      <div className="container p-4 max-w-5xl">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 max-sm:text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left max-sm:hidden">#</th>
                <th className="px-4 py-2 border-b text-left">Job Title</th>
                <th className="px-4 py-2 border-b text-left max-sm:hidden">Date</th>
                <th className="px-4 py-2 border-b text-left max-sm:hidden">Location</th>
                <th className="px-4 py-2 border-b text-left">Applicants</th>
                <th className="px-4 py-2 border-b text-left">Visible</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <tr className="text-gray-700" key={job._id || index}>
                    <td className="px-4 py-2 border-b max-sm:hidden">{index + 1}</td>
                    <td className="px-4 py-2 border-b">{job.title}</td>
                    <td className="px-4 py-2 border-b max-sm:hidden">{moment(job.date).format('ll')}</td>
                    <td className="px-4 py-2 border-b max-sm:hidden">{job.location}</td>
                    <td className="px-4 py-2 border-b text-center">{job.applicants}</td>
                    <td className="px-4 py-2 border-b">
                      <input
                        onChange={() => changeJobVisibility(job._id, job.visible)}
                        className="scale-125 ml-4"
                        type="checkbox"
                        checked={job.visible}
                      />
                      <button onClick={() => deleteJobHandler(job._id)} title="Delete Job">
            <Trash2 className="text-red-500 hover:text-red-700 cursor-pointer w-4 h-4" />
          </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => navigate('/dashboard/add-job')}
            className="rounded cursor-pointer bg-black text-gray-50 py-2 px-4"
          >
            Add New Job
          </button>
        </div>
      </div>
    )
  ) : (
    <div  className="rounded cursor-pointer bg-black text-gray-50 py-2 px-4">
      
    </div>
  )
};

export default ManageJobs;
