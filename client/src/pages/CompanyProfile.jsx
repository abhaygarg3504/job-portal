import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";

import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import moment from "moment";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import CompanyAnalytics from "./CompanyAnalytics";

const CompanyProfile = () => {
  const { companyData, backendURL } = useContext(AppContext);
  const [activityData, setActivityData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    if (!companyData?._id) return;

    const fetchActivity = async () => {
      try {
        const res = await fetch(
          `${backendURL}/api/company/activity-graph/${companyData._id}`
        );
        const data = await res.json();
        if (data.success) {
          const rawGraph = data.graph;

          const values = Object.entries(rawGraph).map(([date, count]) => ({
            date,
            count,
          }));

          setActivityData(values);

          const years = new Set(
            values.map((val) => new Date(val.date).getFullYear())
          );
          setAvailableYears(Array.from(years).sort((a, b) => b - a));
        }
      } catch (err) {
        console.error("Failed to fetch company activity", err);
      }
    };

    fetchActivity();
  }, [companyData, backendURL]);

  if (!companyData) return null;

  return (
    <div className="container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10">
      <div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-10 flex items-center gap-6">
          <div className="relative">
            <img
              src={companyData.image}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-300"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{companyData?.name}</h2>
            <p className="text-gray-600">{companyData?.email}</p>
          </div>
        </div>

        <div className="flex justify-between mr-10">
          <h2 className="text-xl font-semibold my-6">Company Activity</h2>
          <div className="mb-4">
            <label htmlFor="year-select" className="font-medium mr-2">
              Select Year:
            </label>
            <select
              id="year-select"
              className="border px-3 py-1 rounded"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

       <div className="bg-white p-4 rounded-lg shadow-md w-full">
  <div className="overflow-x-auto">
    <div className="min-w-[800px]">
      <CalendarHeatmap
        startDate={new Date(`${selectedYear}-01-01`)}
        endDate={new Date(`${selectedYear}-12-31`)}
        values={activityData
          .filter(
            (item) => new Date(item.date).getFullYear() === selectedYear
          )
          .map((item) => ({
            date: moment(item.date).format("YYYY-MM-DD"),
            count: item.count,
          }))}
        classForValue={(value) => {
          if (!value || value.count === 0) return "color-empty";
          return `color-github-${Math.min(value.count, 4)}`;
        }}
        tooltipDataAttrs={(value) => ({
          "data-tooltip-id": "heatmap-tooltip",
          "data-tooltip-html": value.date
            ? `${value.date}<br/>${value.count} application(s)`
            : "No data",
        })}
        showWeekdayLabels={true}
      />
    </div>
  </div>
  <Tooltip id="heatmap-tooltip" />
</div>

      </div>
      <CompanyAnalytics/>
    </div>
  );
};

export default CompanyProfile;
