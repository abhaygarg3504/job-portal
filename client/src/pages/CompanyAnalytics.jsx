import React, { useContext, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { AppContext } from "../context/AppContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 transition hover:shadow-lg">
    <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const CompanyAnalytics = () => {
  const { companyData, backendURL } = useContext(AppContext);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!companyData?._id) return;
    fetch(`${backendURL}/api/company/analytics/${companyData._id}`)
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error("Error fetching analytics:", err));
  }, [companyData, backendURL]);

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-500">
        Loading analytics...
      </div>
    );
  }

  const barData = {
    labels: analytics.applicationsPerJob.map(j => j.jobTitle),
    datasets: [
      {
        label: "Applications",
        data: analytics.applicationsPerJob.map(j => j.count),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const doughnutData = {
    labels: ["Selected", "Rejected", "In Review"],
    datasets: [
      {
        data: [
          analytics.outcomeBreakdown.selected,
          analytics.outcomeBreakdown.rejected,
          analytics.outcomeBreakdown.review,
        ],
        backgroundColor: ["#22c55e", "#ef4444", "#f59e42"],
      },
    ],
  };

  const lineData = {
    labels: analytics.applicationsOverTime.map(a => a.date),
    datasets: [
      {
        label: "Applications",
        data: analytics.applicationsOverTime.map(a => a.count),
        fill: false,
        borderColor: "#3b82f6",
        tension: 0.1,
      },
    ],
  };

  const fillRateData = {
    labels: analytics.jobFillRates.map(j => j.jobTitle),
    datasets: [
      {
        label: "Days to Fill",
        data: analytics.jobFillRates.map(j => j.daysToFill),
        backgroundColor: "#f59e42",
      },
    ],
  };

  const stackedBarData = {
    labels: analytics.statusDistributionPerJob.map(j => j.jobTitle),
    datasets: [
      {
        label: "Selected",
        data: analytics.statusDistributionPerJob.map(j => j.selected),
        backgroundColor: "#22c55e",
      },
      {
        label: "Rejected",
        data: analytics.statusDistributionPerJob.map(j => j.rejected),
        backgroundColor: "#ef4444",
      },
      {
        label: "In Review",
        data: analytics.statusDistributionPerJob.map(j => j.review),
        backgroundColor: "#f59e42",
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
        📊 Company Analytics Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ChartCard title="Applications per Job">
          <Bar data={barData} />
        </ChartCard>

        <ChartCard title="Application Outcome Breakdown">
          <Doughnut data={doughnutData} />
        </ChartCard>

        <div className="md:col-span-2">
          <ChartCard title="Applications Over Time">
            <Line data={lineData} />
          </ChartCard>
        </div>

        <div className="md:col-span-2">
          <ChartCard title="Job Fill Rate">
            <Bar data={fillRateData} options={{ indexAxis: "y" }} />
          </ChartCard>
        </div>

        <div className="md:col-span-2">
          <ChartCard title="Status Distribution Per Job">
            <Bar
              data={stackedBarData}
              options={{
                plugins: {
                  legend: { position: "top" },
                },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true },
                },
              }}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalytics;
