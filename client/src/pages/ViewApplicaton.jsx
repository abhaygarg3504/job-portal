
import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewApplication = () => {
  const { backendURL, companyToken } = useContext(AppContext);
  const [applicants, setApplicants] = useState([]);

  const fetchCompanyJobApplicants = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/company/applicants`, {
        headers: { 
          Authorization: `Bearer ${companyToken}`
        },
      });
  
      if (data.success) {
        toast.success(data.message);
        setApplicants(data.applicants.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };
   
  // function to update job application status
  const changeJobApplicationStatus = async (id, status) => {
    try {
      const { data } = await axios.post(
        `${backendURL}/api/company/change-status`,
        { id, status },
        {
          headers: {
            Authorization: `Bearer ${companyToken}`,
          },
        }
      );
  
      if (data.success) {
        toast.success("Status Updated Successfully!");
        fetchCompanyJobApplicants(); // Refresh the list after status change
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(`Error in changeJobApplicationStatus: ${err.message}`);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };
  

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplicants();
    }
  }, [companyToken]);

  return applicants ? (
    applicants.length === 0 ? (
      <div>No applicants There</div>
    ) : (
      <div className="container mx-auto p-3">
        <div>
          <table className="w-full max-w-4xl bg-white border border-gray-200 table-fixed max-sm:text-sm">
            <thead>
              <tr className="border-b">
                <th className="w-1/6 px-4 py-2">#</th>
                <th className="w-1/6 px-4 py-2">Username</th>
                <th className="w-1/6 px-4 max-sm:hidden py-2">Job Title</th>
                <th className="w-1/6 px-4 max-sm:hidden py-2">Location</th>
                <th className="w-1/6 px-4 py-2">Resume</th>
                <th className="w-1/6 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {applicants
                .filter((item) => item.jobId && item.userId)
                .map((person, index) => (
                  <tr key={index} className="text-gray-700">
                    <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                    <td className="py-2 px-4 border-b text-center flex items-center">
                      <img
                        className="w-10 h-10 rounded-full mr-3 max-sm:hidden"
                        src={person.userId?.image || assets.defaultProfile}
                        alt="Profile"
                      />
                      <span>{person.userId?.name || 'N/A'}</span>
                    </td>
                    <td className="py-2 px-4 border-b max-sm:hidden">{person.jobId?.title || 'N/A'}</td>
                    <td className="py-2 px-4 border-b max-sm:hidden">{person.jobId?.location || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">
                      {person.userId?.resume ? (
                        <a
                          href={person.userId.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-50 text-blue-400 px-3 py-1 rounded inline-flex gap-2 items-center"
                        >
                          Resume <img src={assets.resume_download_icon} alt="Download" />
                        </a>
                      ) : (
                        'No Resume'
                      )}
                    </td>
                    <td className="py-2 px-4 border-b relative">
  {person.status === "Pending" ? (
    <div className="relative inline-block text-left group">
      <button className="text-gray-500 action-button">...</button>
      <div className="absolute hidden right-0 top-0 mt-2 w-32 bg-white border md:left-0 border-gray-200 rounded shadow group-hover:block">
        <button
          onClick={() => changeJobApplicationStatus(person._id, "Accepted")}
          className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
        >
          Accept
        </button>
        <button
          onClick={() => changeJobApplicationStatus(person._id, "Rejected")}
          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
        >
          Reject
        </button>
      </div>
    </div>
  ) : (
    <div>{person.status}</div>
  )}
</td>


                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  ) : (
    <div  className="rounded cursor-pointer bg-black text-gray-50 py-2 px-4">

    </div>
  );
};

export default ViewApplication;
