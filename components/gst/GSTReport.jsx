// "use client";
// import { useEffect, useState } from "react";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import {
//   FiShield,
//   FiFileText,
//   FiPrinter,
//   FiBriefcase,
//   FiArrowLeft,
// } from "react-icons/fi";
// import Link from "next/link";

// export default function GSTReport({ month }) {
//   const [report, setReport] = useState(null);
//   const [business, setBusiness] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { idToken } = useAuthStatus();

//   useEffect(() => {
//     if (!idToken || !month) return;

//     const fetchReport = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const authFetch = (await import("@/lib/authFetch")).default;
//         const res = await authFetch(`/api/gst-reports/${month}`, {}, idToken);

//         if (!res.ok) {
//           const errData = await res.json();
//           throw new Error(errData.error || "Failed to fetch GST report");
//         }

//         const data = await res.json();
//         const generatedOn = new Intl.DateTimeFormat("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         }).format(new Date());

//         const [year, monthNum] = data.month.split("-").map(Number);
//         const startDate = new Date(year, monthNum - 1, 1);
//         const now = new Date();
//         let endDate =
//           year === now.getFullYear() && monthNum === now.getMonth() + 1
//             ? now
//             : new Date(year, monthNum, 0);

//         const formatter = new Intl.DateTimeFormat("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         });

//         const monthLabel = `${formatter.format(startDate)} - ${formatter.format(
//           endDate,
//         )}`;

//         setReport({ ...data, monthLabel, generatedOn });
//         setBusiness({
//           name: data.business?.name || "Bhutan POS Enterprise",
//           phone: data.business?.phone || "-",
//           address: data.business?.address || "-",
//         });
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchReport();
//   }, [month, idToken]);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950">
//         <div className="text-center font-black uppercase tracking-[0.3em] text-gray-400">
//           Verifying Records...
//         </div>
//       </div>
//     );

//   return (
//     <div className="p-4 md:p-12 bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col items-center">
//       {/* --- INJECTED PRINT ENGINE --- */}
//       <style jsx global>{`
//         @media print {
//           @page {
//             margin: 0.8cm; /* Removes Browser Headers/URL */
//           }
//           body {
//             background: white !important;
//             -webkit-print-color-adjust: exact;
//           }
//           .no-print {
//             display: none !important;
//           }

//           /* Tighten Vertical Spacing for 1-Page fit */
//           .report-card {
//             box-shadow: none !important;
//             border: 1px solid #eee !important;
//             margin: 0 !important;
//             padding: 1.5rem !important; /* Reduced from 4rem */
//           }
//           .section-spacing {
//             margin-bottom: 1.5rem !important;
//           }
//           .grid-spacing {
//             gap: 1rem !important;
//             margin-bottom: 1.5rem !important;
//           }
//           .liability-card {
//             padding: 1.5rem !important;
//           }
//           .print-no-break {
//             break-inside: avoid;
//           }
//         }
//       `}</style>

//       {/* Action Header (Hidden on Print) */}
//       <div className="w-full max-w-3xl flex justify-between items-center mb-8 no-print">
//         <Link
//           href="/gst-reports"
//           className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-pink transition-colors"
//         >
//           <FiArrowLeft /> Back to Analytics
//         </Link>
//         <button
//           onClick={() => window.print()}
//           className="flex items-center gap-2 bg-white dark:bg-gray-900 px-6 py-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest hover:text-brand-pink transition-all active:scale-95"
//         >
//           <FiPrinter size={16} /> Print Official Report
//         </button>
//       </div>

//       {/* Main Document Body */}
//       <div className="report-card bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
//         {/* Document Header Bar */}
//         <div className="h-3 bg-gray-900 dark:bg-brand-pink w-full" />

//         <div className="p-8 md:p-14">
//           {/* Header Section */}
//           <div className="section-spacing flex flex-col md:flex-row justify-between items-start gap-8 mb-10 pb-8 border-b border-gray-50 dark:border-gray-800">
//             <div className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-3 bg-gray-900 text-white rounded-2xl">
//                   <FiBriefcase size={20} />
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-black tracking-tighter uppercase dark:text-white leading-none">
//                     {business.name}
//                   </h1>
//                   <p className="text-[9px] font-bold text-brand-pink uppercase tracking-widest mt-1">
//                     Merchant GST Summary
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="text-left md:text-right">
//               <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase mb-1">
//                 GST Summary
//               </h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                 {report.monthLabel}
//               </p>
//             </div>
//           </div>

//           {/* Compliance Shield */}
//           <div className="section-spacing flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-8 border border-gray-100 dark:border-gray-700 print-no-break">
//             <FiShield size={18} className="text-green-500 shrink-0" />
//             <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//               Certified System Record: This document validates tax collection
//               for the specified period.
//             </p>
//           </div>

//           {/* Financial Breakdown Grid */}
//           <div className="grid-spacing grid grid-cols-2 gap-4 mb-8 print-no-break">
//             <SummaryItem label="Gross Sales" value={report.totalSales} isBold />
//             <SummaryItem
//               label="Total Orders"
//               value={report.totalOrders}
//               isRaw
//             />
//             <SummaryItem label="Taxable Base" value={report.taxableSales} />
//             <SummaryItem
//               label="GST Collected"
//               value={report.gstCollected}
//               isPink
//             />
//           </div>

//           {/* Total Owed Section */}
//           <div className="liability-card relative bg-gray-900 dark:bg-gray-950 rounded-3xl p-8 overflow-hidden print-no-break">
//             <div className="relative z-10 flex flex-col items-center text-center">
//               <h3 className="text-[9px] font-black text-brand-pink uppercase tracking-[0.4em] mb-2">
//                 Net Tax Liability
//               </h3>
//               <p className="text-4xl font-black text-white tracking-tighter font-mono">
//                 Nu.{" "}
//                 {report.gstCollected.toLocaleString(undefined, {
//                   minimumFractionDigits: 2,
//                 })}
//               </p>
//               <p className="mt-3 text-[8px] font-black text-white/40 uppercase tracking-widest">
//                 Remit to Bhutan Ministry of Finance
//               </p>
//             </div>
//           </div>

//           {/* Footer Ledger */}
//           <div className="mt-12 text-center print-no-break">
//             <div className="flex justify-center gap-16 mb-4">
//               <div className="w-24 border-b border-gray-100 dark:border-gray-800 pt-6" />
//               <div className="w-24 border-b border-gray-100 dark:border-gray-800 pt-6" />
//             </div>
//             <div className="flex justify-center gap-16 text-[7px] font-black text-gray-300 uppercase tracking-widest">
//               <span>Authorized</span>
//               <span>Audit Stamp</span>
//             </div>
//             <p className="text-[8px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em] mt-10">
//               Generated via Bhutan POS • {report.generatedOn}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SummaryItem({ label, value, isBold, isPink, isRaw }) {
//   return (
//     <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
//       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
//         {label}
//       </p>
//       <div className="flex items-baseline gap-1">
//         {!isRaw && (
//           <span
//             className={`text-[9px] font-black ${
//               isPink ? "text-brand-pink" : "text-gray-300"
//             }`}
//           >
//             Nu.
//           </span>
//         )}
//         <span
//           className={`text-xl font-black font-mono tracking-tighter ${
//             isBold
//               ? "text-gray-900 dark:text-white"
//               : isPink
//                 ? "text-brand-pink"
//                 : "text-gray-600 dark:text-gray-400"
//           }`}
//         >
//           {isRaw
//             ? value
//             : value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//         </span>
//       </div>
//     </div>
//   );
// }

// "use client";
// import { useEffect, useState } from "react";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import {
//   FiShield,
//   FiPrinter,
//   FiBriefcase,
//   FiArrowLeft,
//   FiPlusCircle,
//   FiMinusCircle,
// } from "react-icons/fi";
// import Link from "next/link";

// export default function GSTReport({ month }) {
//   const [report, setReport] = useState(null);
//   const [business, setBusiness] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { idToken } = useAuthStatus();

//   useEffect(() => {
//     if (!idToken || !month) return;

//     const fetchReport = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const authFetch = (await import("@/lib/authFetch")).default;
//         const res = await authFetch(`/api/gst-reports/${month}`, {}, idToken);

//         if (!res.ok) {
//           const errData = await res.json();
//           throw new Error(errData.error || "Failed to fetch GST report");
//         }

//         const data = await res.json();
//         const generatedOn = new Intl.DateTimeFormat("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         }).format(new Date());

//         const [year, monthNum] = data.month.split("-").map(Number);
//         const startDate = new Date(year, monthNum - 1, 1);
//         const now = new Date();
//         let endDate =
//           year === now.getFullYear() && monthNum === now.getMonth() + 1
//             ? now
//             : new Date(year, monthNum, 0);

//         const formatter = new Intl.DateTimeFormat("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         });

//         const monthLabel = `${formatter.format(startDate)} - ${formatter.format(endDate)}`;

//         setReport({ ...data, monthLabel, generatedOn });
//         setBusiness({
//           name: data.business?.name || "Bhutan POS Enterprise",
//           tpn: data.business?.gstNumber || "TPN PENDING",
//         });
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchReport();
//   }, [month, idToken]);

//   if (loading || !report)
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950 text-center font-black uppercase tracking-[0.3em] text-gray-400">
//         Verifying Tax Records...
//       </div>
//     );

//   // Math for reconciliation
//   const netPayable = report.gstCollected - (report.itcClaimed || 0);

//   return (
//     <div className="p-4 md:p-12 bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col items-center">
//       <style jsx global>{`
//         @media print {
//           @page {
//             margin: 0.8cm;
//           }
//           body {
//             background: white !important;
//             -webkit-print-color-adjust: exact;
//           }
//           .no-print {
//             display: none !important;
//           }
//           .report-card {
//             box-shadow: none !important;
//             border: 1px solid #eee !important;
//             margin: 0 !important;
//             padding: 2rem !important;
//           }
//           .section-spacing {
//             margin-bottom: 1.2rem !important;
//           }
//           .grid-spacing {
//             gap: 0.75rem !important;
//             margin-bottom: 1.2rem !important;
//           }
//           .liability-card {
//             padding: 2rem !important;
//           }
//         }
//       `}</style>

//       {/* Action Header */}
//       <div className="w-full max-w-3xl flex justify-between items-center mb-8 no-print">
//         <Link
//           href="/gst-reports"
//           className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-pink transition-colors"
//         >
//           <FiArrowLeft /> Back to Analytics
//         </Link>
//         <button
//           onClick={() => window.print()}
//           className="flex items-center gap-2 bg-white dark:bg-gray-900 px-6 py-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest hover:text-brand-pink transition-all active:scale-95"
//         >
//           <FiPrinter size={16} /> Print Report
//         </button>
//       </div>

//       <div className="report-card bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
//         <div className="h-3 bg-gray-900 dark:bg-brand-pink w-full" />

//         <div className="p-8 md:p-14">
//           {/* Header Section */}
//           <div className="section-spacing flex flex-col md:flex-row justify-between items-start gap-8 mb-10 pb-8 border-b border-gray-50 dark:border-gray-800">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-gray-900 text-white rounded-2xl">
//                 <FiBriefcase size={20} />
//               </div>
//               <div>
//                 <h1 className="text-xl font-black tracking-tighter uppercase dark:text-white leading-none">
//                   {business.name}
//                 </h1>
//                 <p className="text-[9px] font-bold text-brand-pink uppercase tracking-widest mt-1">
//                   GST TPN: {business.tpn}
//                 </p>
//               </div>
//             </div>
//             <div className="text-left md:text-right">
//               <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase mb-1">
//                 GST Summary
//               </h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                 {report.monthLabel}
//               </p>
//             </div>
//           </div>

//           {/* Compliance Shield */}
//           <div className="section-spacing flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-8 border border-gray-100 dark:border-gray-700">
//             <FiShield size={18} className="text-green-500 shrink-0" />
//             <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-relaxed">
//               Official BRS Consolidation: This document validates tax collection
//               (Output) minus credits earned (Input) for the assessment period.
//             </p>
//           </div>

//           {/* Financial Breakdown Grid */}
//           <div className="grid-spacing grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
//             <SummaryItemCount
//               label="Total Sales"
//               value={report.saleCount || 0}
//               isBold
//             />
//             <SummaryItemCount
//               label="Total Purchases"
//               value={report.purchaseCount || 0}
//             />
//             <SummaryItem
//               label="Total Taxable Sales"
//               value={report.taxableSales}
//               isBold
//             />
//             <SummaryItem
//               label="Total Taxable Purchases"
//               value={report.taxablePurchases || 0}
//             />
//             <SummaryItem
//               label="Output Tax"
//               value={report.gstCollected}
//               isPink
//               icon={<FiPlusCircle className="text-green-500" />}
//             />
//             <SummaryItem
//               label="Input Credit"
//               value={report.itcClaimed || 0}
//               isBlue
//               icon={<FiMinusCircle className="text-blue-500" />}
//             />
//           </div>

//           {/* Total Net Section */}
//           <div
//             className={`liability-card relative rounded-3xl p-8 overflow-hidden transition-colors ${netPayable > 0 ? "bg-gray-900" : "bg-blue-600"}`}
//           >
//             <div className="relative z-10 flex flex-col items-center text-center">
//               <h3 className="text-[9px] font-black text-white/50 uppercase tracking-[0.4em] mb-2">
//                 {netPayable > 0 ? "Net Tax Liability" : "Tax Carry Forward"}
//               </h3>
//               <p className="text-5xl font-black text-white tracking-tighter font-mono italic">
//                 Nu.
//                 {Math.abs(netPayable).toLocaleString(undefined, {
//                   minimumFractionDigits: 2,
//                 })}
//               </p>
//               <p className="mt-4 text-[8px] font-black text-white/30 uppercase tracking-[0.2em] leading-relaxed">
//                 {netPayable > 0
//                   ? "Remittance due to the Bhutan Ministry of Finance"
//                   : "Excess Input Tax Credit to be utilized in future periods"}
//               </p>
//             </div>
//           </div>

//           {/* Minimal Footer Info */}
//           <div className="mt-12 pt-8 border-t border-dashed border-gray-100 dark:border-gray-800 flex justify-between items-center opacity-40">
//             <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest italic">
//               System ID: {report.month}-{report.totalOrders}
//             </p>
//             <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
//               Generated via SwiftGST Ledger • {report.generatedOn}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SummaryItem({ label, value, isBold, isPink, isBlue, icon }) {
//   return (
//     <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl group transition-all">
//       <div className="flex items-center justify-between mb-2">
//         <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
//           {label}
//         </p>
//         <span className="opacity-20 group-hover:opacity-100 transition-opacity">
//           {icon}
//         </span>
//       </div>
//       <div className="flex items-baseline gap-0.5">
//         <span
//           className={`text-[8px] font-black ${isPink ? "text-brand-pink" : isBlue ? "text-blue-500" : "text-gray-300"}`}
//         >
//           Nu.
//         </span>
//         <span
//           className={`text-lg font-black font-mono tracking-tighter ${
//             isBold
//               ? "text-gray-900 dark:text-white"
//               : isPink
//                 ? "text-brand-pink"
//                 : isBlue
//                   ? "text-blue-500"
//                   : "text-gray-600 dark:text-gray-400"
//           }`}
//         >
//           {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//         </span>
//       </div>
//     </div>
//   );
// }

// function SummaryItemCount({ label, value, isBold, isPink, isBlue, icon }) {
//   return (
//     <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl group transition-all">
//       <div className="flex items-center justify-between mb-2">
//         <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
//           {label}
//         </p>
//         <span className="opacity-20 group-hover:opacity-100 transition-opacity">
//           {icon}
//         </span>
//       </div>
//       <div className="flex items-baseline gap-0.5">
//         <span
//           className={`text-lg font-black font-mono tracking-tighter ${
//             isBold
//               ? "text-gray-900 dark:text-white"
//               : isPink
//                 ? "text-brand-pink"
//                 : isBlue
//                   ? "text-blue-500"
//                   : "text-gray-600 dark:text-gray-400"
//           }`}
//         >
//           {value}
//         </span>
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import {
  FiShield,
  FiPrinter,
  FiBriefcase,
  FiArrowLeft,
  FiPlusCircle,
  FiMinusCircle,
  FiRefreshCcw,
} from "react-icons/fi";
import Link from "next/link";

export default function GSTReport({ month }) {
  const [report, setReport] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idToken } = useAuthStatus();

  useEffect(() => {
    if (!idToken || !month) return;

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const authFetch = (await import("@/lib/authFetch")).default;
        const res = await authFetch(`/api/gst-reports/${month}`, {}, idToken);

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch GST report");
        }

        const data = await res.json();
        const generatedOn = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date());

        const [year, monthNum] = data.month.split("-").map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const now = new Date();
        let endDate =
          year === now.getFullYear() && monthNum === now.getMonth() + 1
            ? now
            : new Date(year, monthNum, 0);

        const formatter = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const monthLabel = `${formatter.format(startDate)} - ${formatter.format(endDate)}`;

        setReport({ ...data, monthLabel, generatedOn });
        setBusiness({
          name: data.business?.name || "Bhutan POS Enterprise",
          tpn: data.business?.gstNumber || "TPN PENDING",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [month, idToken]);

  if (loading || !report)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950 text-center font-black uppercase tracking-[0.3em] text-gray-400">
        Verifying Tax Records...
      </div>
    );

  // 🧮 INDUSTRIAL RECONCILIATION MATH
  const netOutput = report.gstCollected - (report.gstRefunded || 0);
  const netPayable = netOutput - (report.itcClaimed || 0);

  return (
    <div className="p-4 md:p-12 bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col items-center">
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.8cm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .report-card {
            box-shadow: none !important;
            border: 1px solid #000 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Action Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8 no-print">
        <Link
          href="/gst-reports"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-pink transition-colors"
        >
          <FiArrowLeft /> Back to Analytics
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white dark:bg-gray-900 px-6 py-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest hover:text-brand-pink transition-all active:scale-95"
        >
          <FiPrinter size={16} /> Print Official Report
        </button>
      </div>

      <div className="report-card bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        <div className="h-3 bg-gray-900 dark:bg-brand-pink w-full" />

        <div className="p-8 md:p-14">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 pb-8 border-b-2 border-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-900 text-white rounded-2xl">
                <FiBriefcase size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter uppercase dark:text-white leading-none">
                  {business.name}
                </h1>
                <p className="text-[9px] font-bold text-brand-pink uppercase tracking-widest mt-1">
                  TPN: {business.tpn}
                </p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase mb-1">
                GST Settlement
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                {report.monthLabel}
              </p>
            </div>
          </div>

          {/* Compliance Shield */}
          <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-8 border border-gray-200 dark:border-gray-700">
            <FiShield size={20} className="text-green-600 shrink-0" />
            <p className="text-[8px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
              Consolidated BRS Report: This document reconciles Total Output
              Tax, Credit Note Adjustments, and Input Tax Credits (ITC) for the
              specified period.
            </p>
          </div>

          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <SummaryItemCount
              label="Sales"
              value={report.saleCount}
              icon={<FiPlusCircle size={10} />}
            />
            <SummaryItemCount
              label="Refunds"
              value={report.refundCount || 0}
              icon={<FiRefreshCcw size={10} />}
            />
            <SummaryItemCount
              label="Purchases"
              value={report.purchaseCount || 0}
              icon={<FiMinusCircle size={10} />}
            />

            <SummaryItem
              label="Output Tax"
              value={report.gstCollected}
              isBold
            />
            <SummaryItem
              label="Tax Refunded"
              value={report.gstRefunded || 0}
              isPink
            />
            <SummaryItem
              label="Input Credit"
              value={report.itcClaimed || 0}
              isBlue
            />
          </div>

          {/* Detailed Reconciliation Table (Minimalist) */}
          <div className="mb-8 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-[9px] font-bold uppercase tracking-widest">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-right">Amount (Nu.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                <tr>
                  <td className="px-6 py-4">Total GST Collected on Sales</td>
                  <td className="px-6 py-4 text-right font-mono">
                    +
                    {report.gstCollected.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-brand-pink">
                    Less: GST on Returns (Credit Notes)
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-brand-pink">
                    -
                    {(report.gstRefunded || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr className="bg-gray-50/50 dark:bg-gray-800/20">
                  <td className="px-6 py-4 font-black">Adjusted Output GST</td>
                  <td className="px-6 py-4 text-right font-black font-mono underline decoration-double">
                    {netOutput.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-blue-500">
                    Less: Input Tax Credit (ITC)
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-blue-500">
                    -
                    {(report.itcClaimed || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Final Settlement Section */}
          <div
            className={`liability-card relative rounded-3xl p-10 overflow-hidden transition-colors border-2 ${netPayable > 0 ? "bg-gray-900 border-gray-900" : "bg-green-600 border-green-600"}`}
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em] mb-3">
                {netPayable > 0
                  ? "Final Tax Liability"
                  : "Tax Carry Forward Amount"}
              </h3>
              <p className="text-6xl font-black text-white tracking-tighter font-mono italic leading-none">
                Nu.
                {Math.abs(netPayable).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
              <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
                <span className="text-[8px] font-black text-white uppercase tracking-widest italic">
                  Verified for BITS Filing v2.0
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center opacity-40 italic">
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
              {report.month}-{report.saleCount}-{report.refundCount}
            </p>
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
              SwiftGST • {report.generatedOn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, isBold, isPink, isBlue }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-0.5">
        <span
          className={`text-[8px] font-black ${isPink ? "text-brand-pink" : isBlue ? "text-blue-500" : "text-gray-300"}`}
        >
          Nu.
        </span>
        <span
          className={`text-lg font-black font-mono tracking-tighter ${isBold ? "text-gray-900 dark:text-white" : isPink ? "text-brand-pink" : isBlue ? "text-blue-500" : "text-gray-600 dark:text-gray-400"}`}
        >
          {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

function SummaryItemCount({ label, value, icon }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border border-transparent rounded-2xl flex justify-between items-start">
      <div>
        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <span className="text-lg font-black font-mono text-gray-900 dark:text-white">
          {value}
        </span>
      </div>
      <div className="text-gray-300">{icon}</div>
    </div>
  );
}
