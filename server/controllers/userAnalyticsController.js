import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";

export const userAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Status Breakdown
    const statusAgg = await JobApplication.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $toLower: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    const statusBreakdown = {
      selected: 0, // means 'Accepted'
      rejected: 0,
      review: 0,   // means 'Pending' or 'In Review'
    };

    statusAgg.forEach((item) => {
      const status = item._id;
      if (status.includes("accept")) statusBreakdown.selected += item.count;
      else if (status.includes("reject")) statusBreakdown.rejected += item.count;
      else statusBreakdown.review += item.count;
    });

    // 2. Applications Over Time
    const timeAgg = await JobApplication.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $toDate: "$date" },
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const applicationsOverTime = timeAgg.map((item) => ({
      date: item._id,
      count: item.count,
    }));

    // 3. Job Role Distribution
    const roleAgg = await JobApplication.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
      {
        $group: {
          _id: "$job.category",
          count: { $sum: 1 },
        },
      },
    ]);

    const jobRoleDistribution = roleAgg.map((item) => ({
      role: item._id,
      count: item.count,
    }));

    // 4. Company Interaction Insights
    const companyAggRaw = await JobApplication.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: "$company" },
      {
        $group: {
          _id: {
            company: "$company.name",
            status: { $toLower: "$status" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const companyInteraction = {};

    companyAggRaw.forEach((item) => {
      const name = item._id.company;
      const status = item._id.status;

      if (!companyInteraction[name]) {
        companyInteraction[name] = {
          selected: 0,
          rejected: 0,
          review: 0,
        };
      }

      if (status.includes("accept")) companyInteraction[name].selected += item.count;
      else if (status.includes("reject")) companyInteraction[name].rejected += item.count;
      else companyInteraction[name].review += item.count;
    });

    const companyInteractionArray = Object.entries(companyInteraction).map(
      ([company, stats]) => ({
        company,
        ...stats,
      })
    );

    // 5. Saved vs Applied + Success Rate
    const user = await User.findById(userId);
    const savedJobs = user.savedJobs.length;
    const appliedJobs = await JobApplication.countDocuments({ userId });
    const selected = statusBreakdown.selected;
    const successRate = appliedJobs ? (selected / appliedJobs) * 100 : 0;

    // ✅ Final Response
    res.json({
      statusBreakdown,
      applicationsOverTime,
      jobRoleDistribution,
      companyInteraction: companyInteractionArray,
      savedJobs,
      appliedJobs,
      successRate: parseFloat(successRate.toFixed(2)),
    });

  } catch (error) {
    console.error("Error in user analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
