// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import authFetch from "@/lib/authFetch";

// export default function GSTReports() {
//   const router = useRouter();
//   const { idToken } = useAuthStatus();

//   const [gstReports, setGstReports] = useState([]); // all available months
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [loading, setLoading] = useState(true);

//   // Fetch GST reports dynamically from API
//   useEffect(() => {
//     if (!idToken) return;

//     const fetchGstReports = async () => {
//       setLoading(true);
//       try {
//         const res = await authFetch("/api/gst-reports", {}, idToken);

//         if (!res.ok) {
//           console.error("Failed to fetch GST reports");
//           setGstReports([]);
//           setLoading(false);
//           return;
//         }

//         const data = await res.json();

//         // data should be array of { month: "YYYY-MM", totalSales, gstCollected }

//         setGstReports(data);

//         // Default to the latest month
//         if (data.length) {
//           const sortedMonths = data
//             .map((r) => r.month)
//             .sort((a, b) => (a > b ? -1 : 1));
//           setSelectedMonth(sortedMonths[0]);
//         }
//       } catch (err) {
//         console.error("Error fetching GST reports:", err);
//         setGstReports([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGstReports();
//   }, [idToken]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-700 dark:text-gray-300">
//         Loading GST reports...
//       </div>
//     );
//   }

//   if (!gstReports.length) {
//     return (
//       <div className="p-6 text-center text-gray-700 dark:text-gray-300">
//         No GST reports found.
//       </div>
//     );
//   }

//   const currentData = gstReports.find((r) => r.month === selectedMonth) || {
//     totalSales: 0,
//     gstCollected: 0,
//   };

//   return (
//     <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
//       {/* Header */}
//       <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
//         GST Reports
//       </h1>

//       {/* Month Selector */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <div></div>
//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
//         >
//           {gstReports
//             .sort((a, b) => (a.month > b.month ? -1 : 1)) // latest first
//             .map((rpt) => (
//               <option key={rpt.month} value={rpt.month}>
//                 {new Date(rpt.month + "-01").toLocaleString("en-US", {
//                   month: "long",
//                   year: "numeric",
//                 })}
//               </option>
//             ))}
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
//             Nu. {currentData.totalSales.toLocaleString()}
//           </p>
//           <p className="mt-1 text-sm text-gray-400">For selected month</p>
//         </div>

//         {/* GST Collected */}
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             GST Collected
//           </p>
//           <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
//             Nu. {currentData.gstCollected.toLocaleString()}
//           </p>
//           <p className="mt-1 text-sm text-gray-400">Taxable sales only</p>
//         </div>
//       </div>

//       {/* View Report Button */}
//       <div className="flex justify-end">
//         <button
//           onClick={() => window.open(`/gst-reports/${selectedMonth}`, "_blank")}
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
import {
  FiCalendar,
  FiPieChart,
  FiTrendingUp,
  FiArrowRight,
  FiActivity,
} from "react-icons/fi";

export default function GSTReports() {
  const router = useRouter();
  const { idToken } = useAuthStatus();

  const [gstReports, setGstReports] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idToken) return;

    const fetchGstReports = async () => {
      setLoading(true);
      try {
        const res = await authFetch("/api/gst-reports", {}, idToken);
        if (!res.ok) {
          setGstReports([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setGstReports(data);

        if (data.length) {
          const sortedMonths = data
            .map((r) => r.month)
            .sort((a, b) => (a > b ? -1 : 1));
          setSelectedMonth(sortedMonths[0]);
        }
      } catch (err) {
        setGstReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGstReports();
  }, [idToken]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
        Calculating Tax Obligations...
      </div>
    );

  if (!gstReports.length)
    return (
      <div className="p-6 text-center font-black uppercase tracking-widest text-gray-400 mt-20">
        No GST data records found.
      </div>
    );

  const currentData = gstReports.find((r) => r.month === selectedMonth) || {
    totalSales: 0,
    gstCollected: 0,
  };

  // Logic for the visual bar (Ratio of Tax to Sales)
  const gstRatio =
    currentData.totalSales > 0
      ? (currentData.gstCollected / currentData.totalSales) * 100
      : 0;

  return (
    <div className="p-4 md:p-12 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
              Tax <span className="text-brand-pink">Analytics</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-1">
              Compliance & Revenue Reporting
            </p>
          </div>

          {/* Period Selector Card */}
          <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="bg-brand-pink/10 p-2 rounded-xl text-brand-pink">
              <FiCalendar size={20} />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-black uppercase tracking-widest outline-none pr-8 cursor-pointer dark:text-white"
            >
              {gstReports
                .sort((a, b) => (a.month > b.month ? -1 : 1))
                .map((rpt) => (
                  <option
                    key={rpt.month}
                    value={rpt.month}
                    className="dark:bg-gray-900"
                  >
                    {new Date(rpt.month + "-01").toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Big Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Total Sales Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 overflow-hidden group">
            <FiTrendingUp
              className="absolute -right-4 -bottom-4 text-gray-50 dark:text-gray-800 group-hover:text-brand-pink/5 transition-colors"
              size={200}
            />
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300" /> Gross
                Revenue
              </h3>
              <p className="text-sm font-black text-brand-pink mb-1">Nu.</p>
              <p className="text-5xl font-black tracking-tighter dark:text-white font-mono">
                {currentData.totalSales.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
              <div className="mt-6 h-1 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
            </div>
          </div>

          {/* GST Collected Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 overflow-hidden group">
            <FiPieChart
              className="absolute -right-4 -bottom-4 text-gray-50 dark:text-gray-800 group-hover:text-brand-pink/5 transition-colors"
              size={200}
            />
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-pink" /> Total GST
                (5%)
              </h3>
              <p className="text-sm font-black text-brand-pink mb-1">Nu.</p>
              <p className="text-5xl font-black tracking-tighter dark:text-white font-mono">
                {currentData.gstCollected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>

              {/* Visual Breakdown Bar */}
              <div className="mt-6 w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-pink transition-all duration-1000"
                  style={{ width: `${Math.min(gstRatio * 10, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details & Actions Section */}
        <div className="bg-gray-900 dark:bg-brand-pink rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl text-white">
              <FiActivity size={24} />
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-sm">
                Download Detailed Report
              </h4>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                Includes SKU breakdown & Exemptions
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              window.open(`/gst-reports/${selectedMonth}`, "_blank")
            }
            className="w-full md:w-auto bg-white text-gray-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Generate Official PDF <FiArrowRight />
          </button>
        </div>

        {/* Footer Hint */}
        <p className="text-center mt-12 text-[9px] font-black text-gray-400 uppercase tracking-[0.5em]">
          Bhutan Ministry of Finance Compliance Standard v2.0
        </p>
      </div>
    </div>
  );
}
