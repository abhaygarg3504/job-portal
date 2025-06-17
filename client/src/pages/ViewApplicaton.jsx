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
const handleDownloadExcel = async () => {
  const response = await fetch(`${backendURL}/api/company/applications/excel`, {
    headers: { Authorization: `Bearer ${companyToken}` }
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "company_applications.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
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
  <div className="container mx-auto px-2 sm:px-4 overflow-x-auto">
     <button onClick={handleDownloadExcel} className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded
                        cursor-pointer hover:bg-blue-700">
  Download CSV(Applications)
</button>
    <table className="min-w-full bg-white border border-gray-200 text-sm sm:text-base">
   
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="px-2 py-3 text-left hidden sm:table-cell">#</th>
          <th className="px-2 py-3 text-left">Username</th>
          <th className="px-2 py-3 text-left hidden sm:table-cell">Job Title</th>
          <th className="px-2 py-3 text-left hidden sm:table-cell">Location</th>
          <th className="px-2 py-3 text-left">Resume</th>
          <th className="px-2 py-3 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {applicants
          .filter((item) => item.jobId && item.userId)
          .map((person, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="px-2 py-2 text-center hidden sm:table-cell">{index + 1}</td>
              <td className="px-2 py-2">
                <div className="flex items-center gap-2 max-w-[180px]">
                  <img
                    className="w-10 h-10 object-cover rounded-full"
                    src={person.userId?.image || assets.defaultProfile}
                    alt="Profile"
                  />
                  <span className="truncate">{person.userId?.name || 'N/A'}</span>
                </div>
              </td>
              <td className="px-2 py-2 hidden sm:table-cell truncate">{person.jobId?.title || 'N/A'}</td>
              <td className="px-2 py-2 hidden sm:table-cell truncate">{person.jobId?.location || 'N/A'}</td>
              <td className="px-2 py-2 text-center">
                {person.userId?.resume ? (
                  <a
                    href={person.userId.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-500 rounded hover:underline"
                  >
                    Resume
                    <img
                      src={assets.resume_download_icon}
                      alt="Download"
                      className="w-4 h-4"
                    />
                  </a>
                ) : (
                  <span className="text-gray-400">No Resume</span>
                )}
              </td>
              <td className="px-2 py-2">
                {person.status === "Pending" ? (
                  <div className="relative inline-block group">
                    <button className="text-gray-500 font-bold">...</button>
                    <div className="absolute hidden group-hover:block z-10 bg-white border rounded shadow-lg w-32">
                      <button
                        onClick={() => changeJobApplicationStatus(person._id, "Accepted")}
                        className="block w-full text-left px-4 py-2 text-green-600 hover:bg-gray-100"
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
                  <div className="flex flex-col gap-1 max-w-[180px]">
                    <span className="text-green-600 font-semibold">Accepted</span>
                    <label className="text-xs text-gray-600">Set Interview Date:</label>
                    <DatePicker
                      selected={interviewDates[person._id] || null}
                      onChange={(date) => handleInterviewDateChange(date, person._id)}
                      className="border p-1 rounded w-full text-sm"
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
