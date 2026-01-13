// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function GSTReports() {
//   const router = useRouter();

//   // Mock monthly data (replace with API later)
//   const gstDataByMonth = {
//     "2026-01": {
//       totalSales: 124560,
//       gstCollected: 6228,
//     },
//     "2026-02": {
//       totalSales: 98200,
//       gstCollected: 4910,
//     },
//   };

//   const [selectedMonth, setSelectedMonth] = useState("2026-01");

//   const currentData = gstDataByMonth[selectedMonth];

//   return (
//     <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
//       {/* Header */}
//       <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
//         GST Reports
//       </h1>
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <div></div>
//         {/* Month Selector */}
//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
//         >
//           <option value="2026-01">January 2026</option>
//           <option value="2026-02">February 2026</option>
//         </select>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//         {/* Total Sales */}
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Total Sales
//           </p>
//           <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
//             ₹{currentData.totalSales.toLocaleString()}
//           </p>
//           <p className="mt-1 text-sm text-gray-400">For selected month</p>
//         </div>

//         {/* GST Collected */}
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             GST Collected
//           </p>
//           <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
//             ₹{currentData.gstCollected.toLocaleString()}
//           </p>
//           <p className="mt-1 text-sm text-gray-400">Taxable sales only</p>
//         </div>
//       </div>

//       {/* View Report Button */}
//       <div className="flex justify-end">
//         <button
//           onClick={() => router.push(`/gst-reports/${selectedMonth}`)}
//           className="btn-primary px-6 py-3 font-semibold"
//         >
//           View GST Report
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";

export default function GSTReports() {
  const router = useRouter();
  const { idToken } = useAuthStatus();

  const [gstReports, setGstReports] = useState([]); // all available months
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch GST reports dynamically from API
  useEffect(() => {
    if (!idToken) return;

    const fetchGstReports = async () => {
      setLoading(true);
      try {
        const res = await authFetch("/api/gst-reports", {}, idToken);

        if (!res.ok) {
          console.error("Failed to fetch GST reports");
          setGstReports([]);
          setLoading(false);
          return;
        }

        const data = await res.json();

        // data should be array of { month: "YYYY-MM", totalSales, gstCollected }

        setGstReports(data);

        // Default to the latest month
        if (data.length) {
          const sortedMonths = data
            .map((r) => r.month)
            .sort((a, b) => (a > b ? -1 : 1));
          setSelectedMonth(sortedMonths[0]);
        }
      } catch (err) {
        console.error("Error fetching GST reports:", err);
        setGstReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGstReports();
  }, [idToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700 dark:text-gray-300">
        Loading GST reports...
      </div>
    );
  }

  if (!gstReports.length) {
    return (
      <div className="p-6 text-center text-gray-700 dark:text-gray-300">
        No GST reports found.
      </div>
    );
  }

  const currentData = gstReports.find((r) => r.month === selectedMonth) || {
    totalSales: 0,
    gstCollected: 0,
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
        GST Reports
      </h1>

      {/* Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div></div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        >
          {gstReports
            .sort((a, b) => (a.month > b.month ? -1 : 1)) // latest first
            .map((rpt) => (
              <option key={rpt.month} value={rpt.month}>
                {new Date(rpt.month + "-01").toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
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
          onClick={() => window.open(`/gst-reports/${selectedMonth}`, "_blank")}
          className="btn-primary px-6 py-3 font-semibold"
        >
          View GST Report
        </button>
      </div>
    </div>
  );
}
