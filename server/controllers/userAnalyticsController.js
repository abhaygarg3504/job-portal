import mongoose from "mongoose";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";

export const userAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;
    const now = new Date();

    // Run aggregates in parallel
    const [
      statusAgg,
      timeAgg,
      roleAgg,
      companyAggRaw,
      appliedJobs,
      user
    ] = await Promise.all([
      // 1. Status Breakdown
      JobApplication.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { $toLower: "$status" },
            count: { $sum: 1 }
          }
        }
      ]),

      // 2. Applications Over Time
      JobApplication.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 3. Job Role Distribution
      JobApplication.aggregate([
        { $match: { userId } },
        { $lookup: { from: "jobs", localField: "jobId", foreignField: "_id", as: "job" } },
        { $unwind: "$job" },
        { $group: { _id: "$job.category", count: { $sum: 1 } } }
      ]),

      // 4. Company Interaction Insights
      JobApplication.aggregate([
        { $match: { userId } },
        { $lookup: { from: "companies", localField: "companyId", foreignField: "_id", as: "company" } },
        { $unwind: "$company" },
        {
          $group: {
            _id: { company: "$company.name", status: { $toLower: "$status" } },
            count: { $sum: 1 }
          }
        }
      ]),

      // Count total applied jobs
      JobApplication.countDocuments({ userId }),

      // Fetch user for savedJobs & profile
      User.findById(userId)
    ]);

    // 1a. Format status breakdown
    const statusBreakdown = { selected: 0, rejected: 0, review: 0 };
    statusAgg.forEach(item => {
      if (item._id.includes("accept")) statusBreakdown.selected += item.count;
      else if (item._id.includes("reject")) statusBreakdown.rejected += item.count;
      else statusBreakdown.review += item.count;
    });

    // 2a. Format applications over time
    const applicationsOverTime = timeAgg.map(item => ({ date: item._id, count: item.count }));

    // 3a. Format role distribution
    const jobRoleDistribution = roleAgg.map(item => ({ role: item._id, count: item.count }));

    // 4a. Format company interaction
    const companyInteraction = {};
    companyAggRaw.forEach(item => {
      const name = item._id.company;
      const status = item._id.status;
      companyInteraction[name] = companyInteraction[name] || { selected: 0, rejected: 0, review: 0 };
      if (status.includes("accept")) companyInteraction[name].selected += item.count;
      else if (status.includes("reject")) companyInteraction[name].rejected += item.count;
      else companyInteraction[name].review += item.count;
    });
    const companyInteractionArray = Object.entries(companyInteraction).map(
      ([company, stats]) => ({ company, ...stats })
    );

    // 5. Saved vs Applied + Success Rate
    const savedJobs = user?.savedJobs?.length || 0;
    const selectedCount = statusBreakdown.selected;
    const successRate = appliedJobs ? (selectedCount / appliedJobs) * 100 : 0;

    // 6. Interview Statistics
    const interviews = await JobApplication.aggregate([
      { $match: { userId, interviewDate: { $ne: null } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          upcoming: { $sum: { $cond: [{ $gt: ["$interviewDate", now] }, 1, 0] } },
          past: { $sum: { $cond: [{ $lte: ["$interviewDate", now] }, 1, 0] } }
        }
      }
    ]);
    const interviewStats = interviews[0] || { total: 0, upcoming: 0, past: 0 };

    // Respond
    res.json({
      statusBreakdown,
      applicationsOverTime,
      jobRoleDistribution,
      companyInteraction: companyInteractionArray,
      savedJobs,
      appliedJobs,
      successRate: parseFloat(successRate.toFixed(2)),
      interviewStats
    });
  } catch (error) {
    console.error("Error in user analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
