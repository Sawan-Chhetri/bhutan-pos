// // "use client";
// // import { useState, useEffect } from "react";
// // import { useRouter } from "next/navigation";
// // import useAuthStatus from "@/hooks/useAuthStatus";
// // import authFetch from "@/lib/authFetch";
// // import {
// //   FiCalendar,
// //   FiPieChart,
// //   FiTrendingUp,
// //   FiArrowRight,
// //   FiActivity,
// // } from "react-icons/fi";

// // export default function GSTReports() {
// //   const router = useRouter();
// //   const { idToken } = useAuthStatus();

// //   const [gstReports, setGstReports] = useState([]);
// //   const [selectedMonth, setSelectedMonth] = useState("");
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (!idToken) return;

// //     const fetchGstReports = async () => {
// //       setLoading(true);
// //       try {
// //         const res = await authFetch("/api/gst-reports", {}, idToken);
// //         if (!res.ok) {
// //           setGstReports([]);
// //           setLoading(false);
// //           return;
// //         }
// //         const data = await res.json();
// //         setGstReports(data);

// //         if (data.length) {
// //           const sortedMonths = data
// //             .map((r) => r.month)
// //             .sort((a, b) => (a > b ? -1 : 1));
// //           setSelectedMonth(sortedMonths[0]);
// //         }
// //       } catch (err) {
// //         setGstReports([]);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchGstReports();
// //   }, [idToken]);

// //   if (loading)
// //     return (
// //       <div className="flex justify-center items-center h-screen font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
// //         Calculating Tax Obligations...
// //       </div>
// //     );

// //   if (!gstReports.length)
// //     return (
// //       <div className="p-6 text-center font-black uppercase tracking-widest text-gray-400 mt-20">
// //         No GST data records found.
// //       </div>
// //     );

// //   const currentData = gstReports.find((r) => r.month === selectedMonth) || {
// //     totalSales: 0,
// //     gstCollected: 0,
// //   };

// //   // Logic for the visual bar (Ratio of Tax to Sales)
// //   const gstRatio =
// //     currentData.totalSales > 0
// //       ? (currentData.gstCollected / currentData.totalSales) * 100
// //       : 0;

// //   return (
// //     <div className="p-4 md:p-12 bg-gray-50 dark:bg-gray-950 min-h-screen">
// //       <div className="max-w-5xl mx-auto">
// //         {/* Header Area */}
// //         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
// //           <div>
// //             <h1 className="text-4xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
// //               Tax <span className="text-brand-pink">Analytics</span>
// //             </h1>
// //             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-1">
// //               Compliance & Revenue Reporting
// //             </p>
// //           </div>

// //           {/* Period Selector Card */}
// //           <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
// //             <div className="bg-brand-pink/10 p-2 rounded-xl text-brand-pink">
// //               <FiCalendar size={20} />
// //             </div>
// //             <select
// //               value={selectedMonth}
// //               onChange={(e) => setSelectedMonth(e.target.value)}
// //               className="bg-transparent text-xs font-black uppercase tracking-widest outline-none pr-8 cursor-pointer dark:text-white"
// //             >
// //               {gstReports
// //                 .sort((a, b) => (a.month > b.month ? -1 : 1))
// //                 .map((rpt) => (
// //                   <option
// //                     key={rpt.month}
// //                     value={rpt.month}
// //                     className="dark:bg-gray-900"
// //                   >
// //                     {new Date(rpt.month + "-01").toLocaleString("en-US", {
// //                       month: "long",
// //                       year: "numeric",
// //                     })}
// //                   </option>
// //                 ))}
// //             </select>
// //           </div>
// //         </div>

// //         {/* Big Summary Cards */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
// //           {/* Total Sales Card */}
// //           <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 overflow-hidden group">
// //             <FiTrendingUp
// //               className="absolute -right-4 -bottom-4 text-gray-50 dark:text-gray-800 group-hover:text-brand-pink/5 transition-colors"
// //               size={200}
// //             />
// //             <div className="relative z-10">
// //               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
// //                 <div className="w-2 h-2 rounded-full bg-gray-300" /> Gross
// //                 Revenue
// //               </h3>
// //               <p className="text-sm font-black text-brand-pink mb-1">Nu.</p>
// //               <p className="text-5xl font-black tracking-tighter dark:text-white font-mono">
// //                 {currentData.totalSales.toLocaleString(undefined, {
// //                   minimumFractionDigits: 2,
// //                 })}
// //               </p>
// //               <div className="mt-6 h-1 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
// //             </div>
// //           </div>

// //           {/* GST Collected Card */}
// //           <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 overflow-hidden group">
// //             <FiPieChart
// //               className="absolute -right-4 -bottom-4 text-gray-50 dark:text-gray-800 group-hover:text-brand-pink/5 transition-colors"
// //               size={200}
// //             />
// //             <div className="relative z-10">
// //               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
// //                 <div className="w-2 h-2 rounded-full bg-brand-pink" /> Total GST
// //                 (5%)
// //               </h3>
// //               <p className="text-sm font-black text-brand-pink mb-1">Nu.</p>
// //               <p className="text-5xl font-black tracking-tighter dark:text-white font-mono">
// //                 {currentData.gstCollected.toLocaleString(undefined, {
// //                   minimumFractionDigits: 2,
// //                 })}
// //               </p>

// //               {/* Visual Breakdown Bar */}
// //               <div className="mt-6 w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
// //                 <div
// //                   className="h-full bg-brand-pink transition-all duration-1000"
// //                   style={{ width: `${Math.min(gstRatio * 10, 100)}%` }}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Details & Actions Section */}
// //         <div className="bg-gray-900 dark:bg-brand-pink rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
// //           <div className="flex items-center gap-4">
// //             <div className="bg-white/20 p-4 rounded-2xl text-white">
// //               <FiActivity size={24} />
// //             </div>
// //             <div>
// //               <h4 className="text-white font-black uppercase tracking-widest text-sm">
// //                 Download Detailed Report
// //               </h4>
// //               <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
// //                 Includes SKU breakdown & Exemptions
// //               </p>
// //             </div>
// //           </div>

// //           <button
// //             onClick={() =>
// //               window.open(`/gst-reports/${selectedMonth}`, "_blank")
// //             }
// //             className="w-full md:w-auto bg-white text-gray-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
// //           >
// //             Generate Official PDF <FiArrowRight />
// //           </button>
// //         </div>

// //         {/* Footer Hint */}
// //         <p className="text-center mt-12 text-[9px] font-black text-gray-400 uppercase tracking-[0.5em]">
// //           Bhutan Ministry of Finance Compliance Standard v2.0
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import authFetch from "@/lib/authFetch";
// import {
//   FiCalendar,
//   FiPieChart,
//   FiTrendingUp,
//   FiArrowRight,
//   FiActivity,
//   FiDownload,
//   FiMinusCircle,
//   FiPlusCircle,
// } from "react-icons/fi";

// export default function GSTReports() {
//   const router = useRouter();
//   const { idToken } = useAuthStatus();

//   const [gstReports, setGstReports] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!idToken) return;

//     const fetchGstReports = async () => {
//       setLoading(true);
//       try {
//         const res = await authFetch("/api/gst-reports", {}, idToken);
//         if (!res.ok) {
//           setGstReports([]);
//           setLoading(false);
//           return;
//         }
//         const data = await res.json();
//         setGstReports(data);

//         if (data.length) {
//           const sortedMonths = data
//             .map((r) => r.month)
//             .sort((a, b) => (a > b ? -1 : 1));
//           setSelectedMonth(sortedMonths[0]);
//         }
//       } catch (err) {
//         setGstReports([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGstReports();
//   }, [idToken]);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-screen font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
//         Calculating Net Tax Liability...
//       </div>
//     );

//   // Fallback for missing data
//   const currentData = gstReports.find((r) => r.month === selectedMonth) || {
//     totalSales: 0,
//     gstCollected: 0,
//     totalPurchases: 0,
//     inputTax: 0, // NEW FIELD
//   };

//   // The critical math for Input Credit
//   const netGstPayable = currentData.gstCollected - currentData.inputTax;

//   return (
//     <div className="p-4 md:p-12 bg-gray-50 dark:bg-gray-950 min-h-screen">
//       <div className="max-w-5xl mx-auto">
//         {/* Header Area */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
//           <div>
//             <h1 className="text-4xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
//               Tax <span className="text-brand-pink">Liability</span>
//             </h1>
//             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-1">
//               Sales Output vs. Purchase Input
//             </p>
//           </div>

//           <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
//             <div className="bg-brand-pink/10 p-2 rounded-xl text-brand-pink">
//               <FiCalendar size={20} />
//             </div>
//             <select
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(e.target.value)}
//               className="bg-transparent text-xs font-black uppercase tracking-widest outline-none pr-8 cursor-pointer dark:text-white"
//             >
//               {gstReports
//                 .sort((a, b) => (a.month > b.month ? -1 : 1))
//                 .map((rpt) => (
//                   <option
//                     key={rpt.month}
//                     value={rpt.month}
//                     className="dark:bg-gray-900"
//                   >
//                     {new Date(rpt.month + "-01").toLocaleString("en-US", {
//                       month: "long",
//                       year: "numeric",
//                     })}
//                   </option>
//                 ))}
//             </select>
//           </div>
//         </div>

//         {/* 1. PRIMARY CALCULATION: THE OFFSET */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
//           {/* Output Card */}
//           <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
//             <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
//               <FiPlusCircle className="text-green-500" /> Output GST (Sales)
//             </h3>
//             <p className="text-2xl font-mono font-black dark:text-white">
//               Nu. {currentData.gstCollected.toLocaleString()}
//             </p>
//           </div>

//           {/* Input Card */}
//           <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
//             <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
//               <FiMinusCircle className="text-blue-500" /> Input Credit
//               (Purchases)
//             </h3>
//             <p className="text-2xl font-mono font-black dark:text-white">
//               Nu. {currentData.inputTax?.toLocaleString() || 0}
//             </p>
//           </div>

//           {/* NET LIABILITY - COLOR CODED */}
//           <div
//             className={`rounded-[2rem] p-6 shadow-2xl ${
//               netGstPayable > 0
//                 ? "bg-gray-900 text-white"
//                 : "bg-green-600 text-white"
//             }`}
//           >
//             <h3 className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-4">
//               Estimated Net Payable
//             </h3>
//             <p className="text-2xl font-mono font-black">
//               Nu. {Math.max(0, netGstPayable).toLocaleString()}
//             </p>
//             {netGstPayable < 0 && (
//               <p className="text-[8px] font-bold mt-1 uppercase">
//                 Carry Forward: Nu. {Math.abs(netGstPayable).toLocaleString()}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* 2. TREND VISUALS */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
//           <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8 overflow-hidden group">
//             <FiTrendingUp
//               className="absolute -right-4 -bottom-4 text-gray-50 dark:text-gray-800"
//               size={160}
//             />
//             <div className="relative z-10">
//               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
//                 Gross Revenue
//               </h3>
//               <p className="text-4xl font-black tracking-tighter dark:text-white font-mono">
//                 {currentData.totalSales.toLocaleString()}
//               </p>
//             </div>
//           </div>

//           <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8 overflow-hidden group">
//             <FiDownload
//               className="absolute -right-4 -bottom-4 text-gray-50 dark:text-gray-800"
//               size={160}
//             />
//             <div className="relative z-10">
//               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
//                 Total Purchases
//               </h3>
//               <p className="text-4xl font-black tracking-tighter dark:text-white font-mono">
//                 {currentData.totalPurchases?.toLocaleString() || 0}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* 3. DOWNLOAD SECTION */}
//         <div className="bg-brand-pink rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-brand-pink/20">
//           <div className="flex items-center gap-4">
//             <div className="bg-white/20 p-4 rounded-2xl text-white">
//               <FiActivity size={24} />
//             </div>
//             <div>
//               <h4 className="text-white font-black uppercase tracking-widest text-sm italic">
//                 Generate BRS Summary
//               </h4>
//               <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
//                 Audit-ready for DRC verification
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={() =>
//               window.open(`/gst-reports/${selectedMonth}`, "_blank")
//             }
//             className="w-full md:w-auto bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
//           >
//             Download PDF Report <FiArrowRight />
//           </button>
//         </div>

//         <p className="text-center mt-12 text-[9px] font-black text-gray-400 uppercase tracking-[0.5em]">
//           SwiftGST Reporting Engine • Bhutan Standard
//         </p>
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
  FiTrendingUp,
  FiArrowRight,
  FiActivity,
  FiMinusCircle,
  FiPlusCircle,
  FiShield,
  FiShoppingBag,
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
      <div className="flex justify-center items-center h-screen font-black uppercase tracking-[0.3em] text-blue-600 animate-pulse">
        Calculating Net Tax Liability...
      </div>
    );

  if (!gstReports.length)
    return (
      <div className="p-6 text-center font-black uppercase tracking-widest text-gray-400 mt-20">
        No Tax records found for this store.
      </div>
    );

  // Match the data fields from your Firestore transaction
  const currentData = gstReports.find((r) => r.month === selectedMonth) || {
    totalSales: 0,
    gstCollected: 0,
    taxablePurchases: 0,
    itcClaimed: 0,
    saleCount: 0,
    purchaseCount: 0,
  };

  // The critical math for Net Liability
  const netGstPayable =
    currentData.gstCollected - (currentData.itcClaimed || 0);

  return (
    <div className="p-4 md:p-12 bg-[#F8F9FA] dark:bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-8">
          {/* Left/Top: Text Block */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-gray-900 dark:text-white leading-none">
              GST <span className="text-blue-600">Reports</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-3">
              Sales Output <span className="text-blue-600 italic">vs</span>{" "}
              Purchase Input
            </p>
          </div>

          {/* Right/Bottom: Month Selector */}
          <div className="w-full md:w-auto flex justify-center">
            <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 w-fit">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600">
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
        </div>

        {/* 1. THE TAX OFFSET CALCULATION (Visual Math) */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* OUTPUT BOX */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Output
              GST (Sales)
            </h3>
            <p className="text-sm font-black text-gray-400 mb-1">Nu.</p>
            <p className="text-4xl font-mono font-black text-gray-900 dark:text-white italic">
              {currentData.gstCollected.toLocaleString()}
            </p>
          </div>

          {/* INPUT BOX */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Input
              Credit (ITC)
            </h3>
            <p className="text-sm font-black text-gray-400 mb-1">Nu.</p>
            <p className="text-4xl font-mono font-black text-blue-600 italic">
              {currentData.itcClaimed?.toLocaleString() || "0"}
            </p>
          </div>

          {/* NET LIABILITY BOX */}
          <div
            className={`rounded-[2.5rem] p-8 shadow-2xl transition-all ${
              netGstPayable > 0
                ? "bg-gray-900 text-white"
                : "bg-[#A8DF8E] text-white"
            }`}
          >
            <h3 className="text-[9px] font-black uppercase tracking-widest opacity-90 mb-6 flex items-center gap-2">
              <FiShield />{" "}
              {netGstPayable > 0 ? "Net GST Payable" : "Tax Carry Forward"}
            </h3>
            <p className="text-sm font-black opacity-90 mb-1">Nu.</p>
            <p className="text-5xl font-mono font-black italic tracking-tighter">
              {Math.abs(netGstPayable).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 2. VOLUME TRACKING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 relative group overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Total Sales
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                {currentData.saleCount}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 relative group overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Total Taxable Sales
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-normal">
                Nu. {currentData.taxableSales.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 relative group overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Total Purchases
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                {currentData.purchaseCount}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 relative group overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Total Taxable Purchases
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-normal">
                Nu. {currentData.taxablePurchases?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. OFFICIAL ACTIONS */}
        <div className="bg-blue-600 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-500/20">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 p-5 rounded-[2rem] text-white">
              <FiActivity size={32} />
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-lg italic">
                Generate BRS Summary
              </h4>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">
                Official Report for DRC Compliance
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              window.open(`/gst-reports/${selectedMonth}`, "_blank")
            }
            className="w-full md:w-auto bg-gray-900 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl"
          >
            Download Official PDF <FiArrowRight />
          </button>
        </div>

        <p className="text-center mt-16 text-[9px] font-black text-gray-400 uppercase tracking-[0.6em]">
          SwiftGST Analytics Engine
        </p>
      </div>
    </div>
  );
}
