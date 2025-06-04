import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const SavedJobsPanel = ({ isOpen, onClose }) => {
  const { savedJobs } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div
      className={`fixed top-16 right-0 h-[80vh] w-[350px] bg-white shadow-2xl border-l border-gray-200 p-5 z-50 transform transition-transform duration-300 rounded-l-xl overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-semibold text-gray-800">Saved Jobs</h3>
        <button
          className="text-gray-400 hover:text-red-500 transition"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      {savedJobs.length === 0 ? (
        <p className="text-sm text-gray-500">You haven’t saved any jobs yet.</p>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <div
              key={job._id}
              className="border border-gray-200 p-3 rounded-md shadow-sm hover:shadow-md transition duration-200"
            >
              <h4 className="text-base font-medium text-gray-900">
                {job.title}
              </h4>
              <p className="text-sm text-gray-500 mb-2">
                {job.companyId?.name}
              </p>
              <button
                onClick={() => navigate(`/apply-job/${job._id}`)}
                className="text-sm text-blue-600 hover:underline"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPanel;
