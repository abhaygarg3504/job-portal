import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import moment from "moment";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import CompanyAnalytics from "./CompanyAnalytics";
import { Copy } from "lucide-react";

const CompanyProfile = () => {
  const { companyData, backendURL } = useContext(AppContext);

  const [activityData, setActivityData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [copied, setCopied] = useState(false);

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
            values.map((v) => new Date(v.date).getFullYear())
          );
          setAvailableYears(Array.from(years).sort((a, b) => b - a));
        }
      } catch (err) {
        console.error("Failed to fetch company activity", err);
      }
    };

    fetchActivity();
  }, [companyData, backendURL]);

  const handleCopy = async () => {
    const fullUrl = `${window.location.origin}/companyProfile/${companyData?.slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  if (!companyData) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-20 my-10 min-h-[65vh]">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="flex-shrink-0">
          <img
            src={companyData.image}
            alt="Profile"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-300"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold">{companyData.name}</h2>
          <p className="text-gray-600 mt-1">{companyData.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <p
              className="cursor-pointer text-gray-500 hover:text-blue-600 transition"
              onClick={handleCopy}
              title="Click to copy profile URL"
            >
              {companyData.slug}
            </p>
            <Copy
              size={16}
              className="cursor-pointer hover:text-blue-600 transition"
              onClick={handleCopy}
              title="Copy profile URL"
            />
            {copied && (
              <span className="ml-2 text-green-500 text-sm">Copied!</span>
            )}
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">
          Company Activity
        </h2>
        <div>
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

      {/* Heatmap */}
      <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <div className="min-w-[300px] md:min-w-[800px]">
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
            showWeekdayLabels
          />
        </div>
        <Tooltip id="heatmap-tooltip" />
      </div>

      {/* Analytics */}
      <div className="mt-10">
        <CompanyAnalytics />
      </div>
      
    </div>
  );
};

export default CompanyProfile;
