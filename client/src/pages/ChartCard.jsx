import React from "react";

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        {title}
      </h2>
      <div className="h-[300px] md:h-[350px] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
