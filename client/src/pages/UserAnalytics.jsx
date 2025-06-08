import React, { useEffect, useState, useContext } from "react";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { AppContext } from "../context/AppContext";
import ChartCard from "./ChartCard"; // Ensure this exists

ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement
);

const UserAnalytics = () => {
    const {userData, backendURL } = useContext(AppContext);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!userData?._id) return;

    fetch(`${backendURL}/api/users/analytics/${userData?._id}`)
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Error fetching analytics:", err));
  }, [userData?._id, backendURL]);

  if (!analytics) {
    return <div className="text-center text-xl text-gray-500">Loading analytics...</div>;
  }

  // 1. Application Status Breakdown (Doughnut)
  const statusData = {
    labels: ["Selected", "Rejected", "In Review"],
    datasets: [
      {
        data: [
          analytics.statusBreakdown.selected || 0,
          analytics.statusBreakdown.rejected || 0,
          analytics.statusBreakdown.review || 0,
        ],
        backgroundColor: ["#22c55e", "#ef4444", "#f59e42"],
      },
    ],
  };

  // 2. Applications Over Time (Line)
  const timeData = {
    labels: analytics.applicationsOverTime.map((a) => a.date),
    datasets: [
      {
        label: "Applications",
        data: analytics.applicationsOverTime.map((a) => a.count),
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        fill: false,
        tension: 0.2,
      },
    ],
  };

  // 3. Job Role Distribution (Bar)
  const roleData = {
    labels: analytics.jobRoleDistribution.map((r) => r.role),
    datasets: [
      {
        label: "Applications",
        data: analytics.jobRoleDistribution.map((r) => r.count),
        backgroundColor: "#6366f1",
      },
    ],
  };

  // 4. Company Interaction Insights (Horizontal Bar)
  const companyData = {
    labels: analytics.companyInteraction.map((c) => c.company),
    datasets: [
      {
        label: "Selected",
        data: analytics.companyInteraction.map((c) => c.selected),
        backgroundColor: "#22c55e",
      },
      {
        label: "Rejected",
        data: analytics.companyInteraction.map((c) => c.rejected),
        backgroundColor: "#ef4444",
      },
      {
        label: "In Review",
        data: analytics.companyInteraction.map((c) => c.review),
        backgroundColor: "#f59e42",
      },
    ],
  };

  // 5. Saved vs Applied (Pie)
  const savedAppliedData = {
    labels: ["Saved Jobs", "Applied Jobs"],
    datasets: [
      {
        data: [analytics.savedJobs, analytics.appliedJobs],
        backgroundColor: ["#f59e42", "#3b82f6"],
      },
    ],
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <ChartCard title="Application Status Breakdown">
        <Doughnut data={statusData} />
      </ChartCard>

      <ChartCard title="Applications Over Time">
        <Line data={timeData} />
      </ChartCard>

      <ChartCard title="Job Role Distribution">
        <Bar data={roleData} />
      </ChartCard>

      <ChartCard title="Company Interaction Insights">
        <Bar
          data={companyData}
          options={{
            indexAxis: "y",
            plugins: {
              legend: {
                position: "top",
              },
            },
          }}
        />
      </ChartCard>

      <ChartCard title="Saved vs Applied Jobs">
        <Doughnut data={savedAppliedData} />
      </ChartCard>

      <ChartCard title="Application Success Rate">
        <div className="text-4xl font-bold text-center text-green-600">
          {analytics.successRate?.toFixed(1)}%
        </div>
      </ChartCard>
    </div>
  );
};

export default UserAnalytics;
