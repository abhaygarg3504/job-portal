import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';

const ViewApplication = () => {
  const { backendURL, companyToken } = useContext(AppContext);
  const [applicants, setApplicants] = useState([]);
  const [interviewDates, setInterviewDates] = useState({}); 

  const fetchCompanyJobApplicants = async () => {
  try {
    const { data } = await axios.get(`${backendURL}/api/company/applicants`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    });

    if (data.success) {
      const reversedApplicants = data.applicants.reverse();
      setApplicants(reversedApplicants);

      const dates = {};
      reversedApplicants.forEach(app => {
        if (app.interviewDate) {
          dates[app._id] = new Date(app.interviewDate);
        }
      });
      setInterviewDates(dates);
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    toast.error(err.response?.data?.message || err.message);
  }
};

  const changeJobApplicationStatus = async (id, status) => {
    try {
      const { data } = await axios.post(
        `${backendURL}/api/company/change-status`,
        { id, status },
        {
          headers: { Authorization: `Bearer ${companyToken}` },
        }
      );

      if (data.success) {
        toast.success("Status Updated Successfully!");
        fetchCompanyJobApplicants();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(`Error in changeJobApplicationStatus: ${err.message}`);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleInterviewDateChange = async (date, applicationId) => {
    setInterviewDates((prev) => ({ ...prev, [applicationId]: date }));

    try {
      const { data } = await axios.post(
        `${backendURL}/api/company/set-interview-date`,
        { id: applicationId, interviewDate: date },
        {
          headers: {
            Authorization: `Bearer ${companyToken}`,
          },
        }
      );

      if (data.success) {
        toast.success("Interview Date Set Successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set interview date");
    }
  };

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplicants();
    }
  }, [companyToken]);

  return applicants.length === 0 ? (
    <div className="text-center mt-10">No applicants available</div>
  ) : (
    <div className="container mx-auto p-3">
      <table className="w-full max-w-5xl bg-white border border-gray-200 table-fixed max-sm:text-sm">
        <thead>
          <tr className="border-b">
            <th className="w-1/12 px-2 py-2">#</th>
            <th className="w-2/12 px-2 py-2">Username</th>
            <th className="w-2/12 px-2 py-2 max-sm:hidden">Job Title</th>
            <th className="w-2/12 px-2 py-2 max-sm:hidden">Location</th>
            <th className="w-2/12 px-2 py-2">Resume</th>
            <th className="w-3/12 px-2 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {applicants
            .filter((item) => item.jobId && item.userId)
            .map((person, index) => (
              <tr key={index} className="text-gray-700">
                <td className="py-2 px-2 border-b text-center">{index + 1}</td>
                <td className="py-2 px-2 border-b text-center flex items-center justify-center">
                  <img
                    className="w-10 h-10 rounded-full mr-3 max-sm:hidden"
                    src={person.userId?.image || assets.defaultProfile}
                    alt="Profile"
                  />
                  <span>{person.userId?.name || 'N/A'}</span>
                </td>
                <td className="py-2 px-2 border-b max-sm:hidden">{person.jobId?.title || 'N/A'}</td>
                <td className="py-2 px-2 border-b max-sm:hidden">{person.jobId?.location || 'N/A'}</td>
                <td className="py-2 px-2 border-b text-center">
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
                <td className="py-2 px-2 border-b">
                  {person.status === "Pending" ? (
                    <div className="relative inline-block text-left group">
                      <button className="text-gray-500 action-button">...</button>
                      <div className="absolute hidden group-hover:block z-10 bg-white border rounded shadow-lg w-32">
                        <button
                          onClick={() => changeJobApplicationStatus(person._id, "Accepted")}
                          className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => changeJobApplicationStatus(person._id, "Rejected")}
                          className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : person.status === "Accepted" ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-green-600 font-semibold">Accepted</span>
                      <label className="text-sm text-gray-600">Set Interview Date:</label>
                      <DatePicker
                        selected={interviewDates[person._id] || null}
                        onChange={(date) => handleInterviewDateChange(date, person._id)}
                        className="border p-1 rounded w-full"
                        placeholderText="Select a date"
                        minDate={new Date()}
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                  ) : (
                    <span className="text-red-500">{person.status}</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewApplication;
