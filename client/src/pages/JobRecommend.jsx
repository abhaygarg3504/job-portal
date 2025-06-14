import React, { useContext, useEffect } from "react"
import { AppContext } from "../context/AppContext"
import { useNavigate } from "react-router-dom"

const JobRecommend = ({ isOpen, onClose, userId }) => {
  const { recommendedJobs, fetchJobRecommendations } = useContext(AppContext)
  const navigate = useNavigate()

  // When the panel opens, fetch recommendations
  useEffect(() => {
    if (isOpen && userId) {
      fetchJobRecommendations(userId)
    }
  }, [isOpen, userId, fetchJobRecommendations])

  return (
    <div
      className={`fixed top-16 right-0 h-[80vh] w-[350px] bg-white shadow-2xl border-l border-gray-200 p-5 z-50 transform transition-transform duration-300 rounded-l-xl overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-semibold text-gray-800">Job Recommendations</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500">
          ✕
        </button>
      </div>

      {/* Content */}
      {recommendedJobs.length === 0 ? (
        <p className="text-sm text-gray-500">
          No recommendations yet. Click the button again or check back later.
        </p>
      ) : (
        <div className="space-y-4">
          {recommendedJobs.map(job => (
            <div
              key={job._id}
              className="border border-gray-200 p-3 rounded-md shadow-sm hover:shadow-md transition duration-200"
            >
              <h4 className="text-base font-medium text-gray-900">{job.title}</h4>
              <p className="text-sm text-gray-500 mb-1">
                {job.companyId?.name}
              </p>
              <p className="text-sm text-gray-500 mb-2">{job.location}</p>
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
  )
}

export default JobRecommend
