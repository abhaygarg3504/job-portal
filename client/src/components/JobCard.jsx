// import { FaBookmark, FaLock } from "react-icons/fa";
// import React, { useContext } from "react";
// import { AppContext } from "../context/AppContext";
// import { useNavigate } from "react-router-dom";

// const JobCard = ({ job }) => {
//   const navigate = useNavigate();
//   const { savedJobs, saveJobForUser, unsaveJobForUser, userData } = useContext(AppContext);

//   const isSaved = savedJobs.some((j) => j._id === job._id);
//   const isPro = userData?.isPro;

//   // If job is not visible and user is not Pro, blur and lock
//   const isBlurred = !job.visible && !isPro;
//   // If job is visible or user is Pro, allow apply
//   const canApply = job.visible || isPro;

//   return (
//     <div
//       className={`border p-6 shadow rounded relative transition duration-300 ${
//         isBlurred ? "opacity-50" : "hover:shadow-lg"
//       }`}
//       style={{
//         cursor: isBlurred ? "not-allowed" : "pointer",
//         pointerEvents: isBlurred ? "auto" : "auto",
//       }}
//       title={isBlurred ? "Available for Pro members only" : ""}
//       onClick={() => {
//         if (canApply) navigate(`/apply-job/${job._id}`);
//       }}
//       onMouseOver={e => {
//         if (isBlurred) e.currentTarget.style.cursor = "not-allowed";
//       }}
//       onMouseOut={e => {
//         if (isBlurred) e.currentTarget.style.cursor = "not-allowed";
//       }}
//     >
//       {/* Lock icon for invisible jobs (top right) */}
//       {isBlurred && (
//         <FaLock className="absolute top-3 right-3 text-gray-500 text-xl z-20" title="Locked for non-Pro users" />
//       )}

//       {/* Top section */}
//       <div className="flex justify-between items-center relative z-10">
//         <img className="h-8" src={job.companyId.image} alt="Company Logo" />
//         <FaBookmark
//           onClick={e => {
//             e.stopPropagation();
//             if (isSaved) unsaveJobForUser(job._id);
//             else saveJobForUser(job._id);
//           }}
//           className={`cursor-pointer text-xl z-10 ${
//             isSaved ? "text-blue-600" : "text-gray-400"
//           }`}
//         />
//       </div>

//       <h4 className="font-medium text-xl mt-2 relative z-10">{job.title}</h4>

//       <div className="flex items-center gap-3 mt-2 text-xs relative z-10">
//         <span className="bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
//           {job.location}
//         </span>
//         <span className="bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
//           {job.level}
//         </span>
//       </div>

//       <p
//         className="text-sm mt-4 text-gray-500 relative z-10"
//         dangerouslySetInnerHTML={{
//           __html: job.description.slice(0, 150),
//         }}
//       ></p>

//       {/* Buttons */}
//       <div className="mt-4 flex gap-4 text-sm relative z-10">
//         <button
//           disabled={!canApply}
//           onClick={e => {
//             e.stopPropagation();
//             if (canApply) navigate(`/apply-job/${job._id}`);
//           }}
//           className={`rounded px-4 py-2 ${
//             canApply
//               ? "bg-blue-600 text-white"
//               : "bg-gray-400 text-white cursor-not-allowed"
//           }`}
//         >
//           {canApply ? "Apply Now" : "Members Only"}
//         </button>

//         <button
//           onClick={e => {
//             e.stopPropagation();
//             navigate(`/apply-job/${job._id}`);
//           }}
//           className="bg-white text-blue-700 border border-blue-700 rounded px-4 py-2"
//         >
//           Learn More
//         </button>
//       </div>
//     </div>
//   );
// };

// export default JobCard;
import { FaBookmark, FaLock } from "react-icons/fa";
import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { savedJobs, saveJobForUser, unsaveJobForUser, userData } = useContext(AppContext);

  const isSaved = savedJobs.some((j) => j._id === job._id);
  const isPro = userData?.isPro;
  const jobVisible = job?.visible;

  const isBlurred = !jobVisible && !isPro;
  const canApply = jobVisible || isPro;

  const handleClick = () => {
    if (canApply) navigate(`/apply-job/${job._id}`);
  };

  return (
    <div
      onClick={handleClick}
      onMouseOver={e => {
        if (isBlurred) e.currentTarget.style.cursor = "not-allowed";
      }}
      onMouseOut={e => {
        if (isBlurred) e.currentTarget.style.cursor = "not-allowed";
      }}
      className={`border p-6 rounded relative transition duration-300 group ${
        isBlurred ? "bg-gray-100 opacity-60 blur-[1px]" : "hover:shadow-lg"
      }`}
      style={{
        cursor: isBlurred ? "not-allowed" : "pointer",
        pointerEvents: isBlurred ? "auto" : "auto",
      }}
      title={isBlurred ? "Only visible to Pro members" : ""}
    >
      {/* 🔒 Lock icon */}
      {isBlurred && (
        <FaLock className="absolute top-3 right-3 text-gray-600 text-xl z-20" />
      )}

      {/* ⭐ Save/Unsave icon */}
      <div className="flex justify-between items-center relative z-10">
        <img className="h-8" src={job.companyId.image} alt="Company Logo" />
        <FaBookmark
          onClick={e => {
            e.stopPropagation();
            if (isSaved) unsaveJobForUser(job._id);
            else saveJobForUser(job._id);
          }}
          className={`cursor-pointer text-xl z-10 ${
            isSaved ? "text-blue-600" : "text-gray-400"
          }`}
        />
      </div>

      <h4 className="font-medium text-xl mt-2 relative z-10">{job.title}</h4>

      <div className="flex items-center gap-3 mt-2 text-xs relative z-10">
        <span className="bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
          {job.location}
        </span>
        <span className="bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
          {job.level}
        </span>
      </div>

      <p
        className="text-sm mt-4 text-gray-500 relative z-10"
        dangerouslySetInnerHTML={{
          __html: job.description.slice(0, 150),
        }}
      ></p>

      {/* Buttons */}
      <div className="mt-4 flex gap-4 text-sm relative z-10">
        <button
          disabled={!canApply}
          onClick={e => {
            e.stopPropagation();
            if (canApply) navigate(`/apply-job/${job._id}`);
          }}
          className={`rounded px-4 py-2 ${
            canApply
              ? "bg-blue-600 text-white"
              : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          {canApply ? "Apply Now" : "Members Only"}
        </button>

        <button
          onClick={e => {
            e.stopPropagation();
            if (canApply) navigate(`/apply-job/${job._id}`);
          }}
          className="bg-white text-blue-700 border border-blue-700 rounded px-4 py-2"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default JobCard;
