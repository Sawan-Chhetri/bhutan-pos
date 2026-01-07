"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GSTReports() {
  const router = useRouter();

  // Mock monthly data (replace with API later)
  const gstDataByMonth = {
    "2026-01": {
      totalSales: 124560,
      gstCollected: 6228,
    },
    "2026-02": {
      totalSales: 98200,
      gstCollected: 4910,
    },
  };

  const [selectedMonth, setSelectedMonth] = useState("2026-01");

  const currentData = gstDataByMonth[selectedMonth];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        GST Reports
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div></div>
        {/* Month Selector */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="2026-01">January 2026</option>
          <option value="2026-02">February 2026</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Total Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Sales
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            ₹{currentData.totalSales.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-400">For selected month</p>
        </div>

        {/* GST Collected */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            GST Collected
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            ₹{currentData.gstCollected.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-400">Taxable sales only</p>
        </div>
      </div>

      {/* View Report Button */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push(`/gst-reports/${selectedMonth}`)}
          className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          View GST Report
        </button>
      </div>
    </div>
  );
}
