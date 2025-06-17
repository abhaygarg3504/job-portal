// import Job from "../models/Job.js";
// import JobApplication from "../models/JobApplication.js";
// import mongoose from "mongoose";

// export const getCompanyAnalytics = async (req, res) => {
//   try {
//     const companyId = req.params.companyId;

//     if (!mongoose.Types.ObjectId.isValid(companyId)) {
//       return res.status(400).json({ success: false, message: "Invalid companyId" });
//     }

//     // 1. Applications per Job
//     const applicationsPerJob = await JobApplication.aggregate([
//       { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
//       {
//         $group: {
//           _id: "$jobId",
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $lookup: {
//           from: "jobs",
//           localField: "_id",
//           foreignField: "_id",
//           as: "job"
//         }
//       },
//       { $unwind: "$job" },
//       {
//         $project: {
//           jobTitle: "$job.title",
//           count: 1
//         }
//       }
//     ]);

//     // 2. Outcome breakdown
//     const outcomeStats = await JobApplication.aggregate([
//       { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const outcomeBreakdown = {
//       selected: 0,
//       rejected: 0,
//       review: 0
//     };
//     for (let stat of outcomeStats) {
//       const key = stat._id.toLowerCase();
//       if (key === "accepted" || key === "selected") outcomeBreakdown.selected += stat.count;
//       else if (key === "rejected") outcomeBreakdown.rejected += stat.count;
//       else outcomeBreakdown.review += stat.count;
//     }

//     // 3. Applications over time (grouped by date)
//     const applicationsOverTime = await JobApplication.aggregate([
//       { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } }
//           },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } },
//       {
//         $project: {
//           date: "$_id",
//           count: 1,
//           _id: 0
//         }
//       }
//     ]);

//     // 4. Job fill rates (days between post and first accepted candidate)
//     const jobs = await Job.find({ companyId: companyId }).lean();

//     const jobFillRates = await Promise.all(jobs.map(async (job) => {
//       const acceptedApp = await JobApplication.findOne({
//         jobId: job._id,
//         companyId,
//         status: { $in: ["accepted", "selected"] }
//       }).sort({ date: 1 }); // earliest accepted

//       const postedDate = new Date(job.date);
//       const filledDate = acceptedApp ? new Date(acceptedApp.date) : null;

//       const daysToFill = filledDate
//         ? Math.ceil((filledDate - postedDate) / (1000 * 60 * 60 * 24))
//         : null;

//       return {
//         jobTitle: job.title,
//         daysToFill: daysToFill !== null ? daysToFill : 0 // or null if you want to show "Unfilled"
//       };
//     }));

//     // 5. Status distribution per job
//     const statusDistributionRaw = await JobApplication.aggregate([
//       { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
//       {
//         $group: {
//           _id: {
//             jobId: "$jobId",
//             status: "$status"
//           },
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const jobIdToTitle = {};
//     for (let job of jobs) {
//       jobIdToTitle[job._id.toString()] = job.title;
//     }

//     const jobStatusMap = {};

//     for (let item of statusDistributionRaw) {
//       const jobId = item._id.jobId.toString();
//       const status = item._id.status.toLowerCase();
//       if (!jobStatusMap[jobId]) {
//         jobStatusMap[jobId] = { jobTitle: jobIdToTitle[jobId], selected: 0, rejected: 0, review: 0 };
//       }

//       if (status === "selected" || status === "accepted") jobStatusMap[jobId].selected += item.count;
//       else if (status === "rejected") jobStatusMap[jobId].rejected += item.count;
//       else jobStatusMap[jobId].review += item.count;
//     }

//     const statusDistributionPerJob = Object.values(jobStatusMap);

//     return res.json({
//       applicationsPerJob,
//       outcomeBreakdown,
//       applicationsOverTime,
//       jobFillRates,
//       statusDistributionPerJob
//     });
//   } catch (err) {
//     console.error("Error in getCompanyAnalytics:", err);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };
import mongoose from "mongoose";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import { getActivityGraphByRole } from "./activityController.js"; // shared logic for activity graphs

export const getCompanyAnalytics = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: "Invalid companyId" });
    }
    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    // 1. Applications per Job
    const applicationsPerJobPromise = JobApplication.aggregate([
      { $match: { companyId: companyObjectId } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
      { $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "_id",
          as: "job"
      } },
      { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },
      { $project: { jobTitle: "$job.title", count: 1, _id: 0 } }
    ]);

    // 2. Outcome breakdown
    const outcomeStatsPromise = JobApplication.aggregate([
      { $match: { companyId: companyObjectId } },
      { $group: { _id: { $toLower: "$status" }, count: { $sum: 1 } } }
    ]);

    // 3. Applications over time
    const applicationsOverTimePromise = JobApplication.aggregate([
      { $match: { companyId: companyObjectId } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } },
          count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } }
    ]);

    // 4. Job fill rates
    const jobsPromise = Job.find({ companyId: companyObjectId }).lean();

    // 5. Status distribution per job
    const statusDistributionRawPromise = JobApplication.aggregate([
      { $match: { companyId: companyObjectId } },
      { $group: {
          _id: { jobId: "$jobId", status: { $toLower: "$status" } },
          count: { $sum: 1 }
      } }
    ]);

    // 6. Company activity graph
    const activityGraphPromise = getActivityGraphByRole(companyId, "company");

    // Execute all in parallel
    const [
      applicationsPerJob,
      outcomeStats,
      applicationsOverTime,
      jobs,
      statusRaw,
      activityGraph
    ] = await Promise.all([
      applicationsPerJobPromise,
      outcomeStatsPromise,
      applicationsOverTimePromise,
      jobsPromise,
      statusDistributionRawPromise,
      activityGraphPromise
    ]);

    // Build outcome breakdown
    const outcomeBreakdown = { selected: 0, rejected: 0, review: 0 };
    outcomeStats.forEach(({ _id, count }) => {
      if (_id.includes("accept") || _id.includes("select")) outcomeBreakdown.selected += count;
      else if (_id.includes("reject")) outcomeBreakdown.rejected += count;
      else outcomeBreakdown.review += count;
    });

    // Build job fill rates
    const jobFillRates = await Promise.all(jobs.map(async job => {
      const acceptedApp = await JobApplication.findOne({
        jobId: job._id,
        companyId: companyObjectId,
        status: { $in: ["accepted", "selected"] }
      }).sort({ date: 1 });

      const postedDate = new Date(job.date || job.createdAt);
      const filledDate = acceptedApp ? new Date(acceptedApp.date) : null;
      const daysToFill = filledDate
        ? Math.ceil((filledDate - postedDate) / (1000 * 60 * 60 * 24))
        : null;

      return {
        jobTitle: job.title,
        daysToFill: daysToFill !== null ? daysToFill : null
      };
    }));

    // Build status distribution per job
    const jobIdToTitle = jobs.reduce((map, job) => {
      map[job._id.toString()] = job.title;
      return map;
    }, {});

    const statusDistributionPerJob = Object.values(
      statusRaw.reduce((acc, { _id, count }) => {
        const id = _id.jobId.toString();
        const status = _id.status;
        if (!acc[id]) {
          acc[id] = { jobTitle: jobIdToTitle[id] || "Unknown", selected: 0, rejected: 0, review: 0 };
        }
        if (status.includes("accept") || status.includes("select")) acc[id].selected += count;
        else if (status.includes("reject")) acc[id].rejected += count;
        else acc[id].review += count;
        return acc;
      }, {})
    );

    return res.json({
      success: true,
      applicationsPerJob,
      outcomeBreakdown,
      applicationsOverTime,
      jobFillRates,
      statusDistributionPerJob,
      activityGraph
    });
  } catch (err) {
    console.error("Error in getCompanyAnalytics:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

