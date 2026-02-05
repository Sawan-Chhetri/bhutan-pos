// "use client";
// import Link from "next/link";
// import { useState, useEffect, useContext } from "react";
// import { UserContext } from "@/contexts/UserContext";
// import PaymentStatusModal from "./PaymentStatusModal";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import {
//   FiFileText,
//   FiUser,
//   FiCalendar,
//   FiDollarSign,
//   FiChevronLeft,
//   FiChevronRight,
//   FiCheckCircle,
//   FiClock,
// } from "react-icons/fi";

// const ITEMS_PER_PAGE = 15;

// export default function SalesScreen() {
//   const [sales, setSales] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const { idToken } = useAuthStatus();
//   const [loading, setLoading] = useState(true);
//   const { user } = useContext(UserContext) || {};
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedSaleId, setSelectedSaleId] = useState(null);
//   const [paidStatus, setPaidStatus] = useState({});

//   const handleTogglePaid = async (saleId, newPaid) => {
//     if (!idToken) return;
//     try {
//       const res = await fetch(`/api/sales/${saleId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${idToken}`,
//         },
//         body: JSON.stringify({ isPaid: newPaid }),
//       });
//       if (res.ok) {
//         setPaidStatus((prev) => ({ ...prev, [saleId]: newPaid }));
//       }
//     } catch (err) {
//       console.error("Failed to update payment status", err);
//     }
//   };

//   useEffect(() => {
//     const fetchSales = async (page) => {
//       if (!idToken) return;
//       setLoading(true);
//       try {
//         const authFetch = (await import("@/lib/authFetch")).default;
//         const res = await authFetch(
//           `/api/sales?page=${page}&limit=${ITEMS_PER_PAGE}`,
//           {},
//           idToken,
//         );
//         if (!res.ok) throw new Error("Failed to fetch sales");
//         const data = await res.json();
//         const formatter = new Intl.DateTimeFormat("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         });

//         const formatted = data.sales.map((sale) => {
//           let saleDate = sale.date;
//           if (sale.date?._seconds) {
//             const d = new Date(sale.date._seconds * 1000);
//             saleDate = formatter.format(d);
//           }
//           return { ...sale, date: saleDate };
//         });

//         setSales(formatted);
//         setTotalPages(Math.ceil(data.totalCount / ITEMS_PER_PAGE));
//         const paidStatusFromBackend = {};
//         formatted.forEach((sale) => {
//           paidStatusFromBackend[sale.id] = !!sale.isPaid;
//         });
//         setPaidStatus(paidStatusFromBackend);
//       } catch (err) {
//         setSales([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSales(currentPage);
//   }, [idToken, currentPage]);

//   // Pagination Logic (Sliding Window)
//   const renderPagination = () => {
//     const delta = 1;
//     const range = [];
//     for (
//       let i = Math.max(2, currentPage - delta);
//       i <= Math.min(totalPages - 1, currentPage + delta);
//       i++
//     ) {
//       range.push(i);
//     }
//     if (currentPage > delta + 2) range.unshift("...");
//     range.unshift(1);
//     if (currentPage < totalPages - (delta + 1)) range.push("...");
//     if (totalPages > 1) range.push(totalPages);

//     return range.map((page, idx) => (
//       <button
//         key={idx}
//         disabled={page === "..."}
//         onClick={() => typeof page === "number" && setCurrentPage(page)}
//         className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
//           page === currentPage
//             ? "bg-brand-pink text-white shadow-lg shadow-pink-500/20"
//             : page === "..."
//               ? "text-gray-400"
//               : "bg-white dark:bg-gray-800 text-gray-500 hover:text-brand-pink border border-gray-100 dark:border-gray-700"
//         }`}
//       >
//         {page}
//       </button>
//     ));
//   };

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-screen font-black uppercase tracking-widest text-gray-400 animate-pulse">
//         Syncing Sales Ledger...
//       </div>
//     );

//   return (
//     <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//           <div>
//             <h1 className="text-center md:text-left text-2xl md:text-3xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
//               Invoices <span className="text-brand-pink">History</span>
//             </h1>
//             <p className="text-center md:text-left text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">
//               Transaction Log & Revenue Tracking
//             </p>
//           </div>
//         </div>

//         {/* Table Container */}
//         <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[700px]">
//               {/* min-w prevents squashing */}
//               <thead>
//                 <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
//                   {/* Sticky Header Column */}
//                   <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
//                     Order Info
//                   </th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                     Customer
//                   </th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                     Date
//                   </th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                     Amount
//                   </th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                     {user?.type === "other" ? "Management" : "Items"}
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-gray-900">
//                 {sales.map((sale) => (
//                   <tr
//                     key={sale.id}
//                     className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
//                   >
//                     {/* Sticky Row Column */}
//                     <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-6 py-5 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
//                       <Link
//                         href={`/invoice/${sale.id}`}
//                         target="_blank"
//                         className="flex items-center gap-3 group/link whitespace-nowrap"
//                       >
//                         <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-brand-pink">
//                           <FiFileText size={16} />
//                         </div>
//                         <span className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover/link:text-brand-pink">
//                           {sale.invoiceNumber}
//                         </span>
//                       </Link>
//                     </td>

//                     <td className="px-6 py-5 whitespace-nowrap">
//                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
//                         <FiUser size={14} className="opacity-50" />
//                         <span className="font-medium">
//                           {sale.customerName || "Walk-in"}
//                         </span>
//                       </div>
//                     </td>

//                     <td className="px-6 py-5 whitespace-nowrap">
//                       <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-tight">
//                         <FiCalendar size={14} />
//                         {sale.date}
//                       </div>
//                     </td>

//                     <td className="px-6 py-5 whitespace-nowrap">
//                       <div className="flex items-baseline gap-1 text-brand-pink font-mono">
//                         <span className="text-[10px] font-black uppercase">
//                           Nu.
//                         </span>
//                         <span className="text-base font-black tracking-tighter">
//                           {sale.total.toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                           })}
//                         </span>
//                       </div>
//                     </td>

//                     <td className="px-6 py-5 whitespace-nowrap">
//                       {user?.type === "other" ? (
//                         <div className="flex items-center gap-4">
//                           <span
//                             className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
//                               paidStatus[sale.id]
//                                 ? "bg-green-50 text-green-600 border-green-200"
//                                 : "bg-amber-50 text-amber-600 border-amber-200"
//                             }`}
//                           >
//                             {paidStatus[sale.id] ? "Paid" : "Pending"}
//                           </span>
//                           {/* Toggle Switch UI */}
//                           <button
//                             onClick={() =>
//                               handleTogglePaid(sale.id, !paidStatus[sale.id])
//                             }
//                             className={`w-10 h-5 rounded-full relative transition-colors ${
//                               paidStatus[sale.id]
//                                 ? "bg-green-500"
//                                 : "bg-gray-300"
//                             }`}
//                           >
//                             <div
//                               className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
//                                 paidStatus[sale.id] ? "left-6" : "left-1"
//                               }`}
//                             />
//                           </button>
//                         </div>
//                       ) : (
//                         <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
//                           {sale.items.length} Items
//                         </span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Pagination Section */}
//         <div className="mt-8 flex items-center justify-center gap-2">
//           <button
//             onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//             disabled={currentPage === 1}
//             className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30"
//           >
//             <FiChevronLeft />
//           </button>

//           <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl">
//             {renderPagination()}
//           </div>

//           <button
//             onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//             disabled={currentPage === totalPages}
//             className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30"
//           >
//             <FiChevronRight />
//           </button>
//         </div>
//       </div>

//       <PaymentStatusModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         paid={!!paidStatus[selectedSaleId]}
//         onToggle={(val) => handleTogglePaid(selectedSaleId, val)}
//       />
//     </div>
//   );
// }

"use client";
import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import PaymentStatusModal from "./PaymentStatusModal";
import useAuthStatus from "@/hooks/useAuthStatus";
import { useRouter } from "next/navigation";
import {
  FiFileText,
  FiUser,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCcw,
  FiCheckCircle,
} from "react-icons/fi";

const ITEMS_PER_PAGE = 15;

export default function SalesScreen() {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { idToken } = useAuthStatus();
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext) || {};
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [paidStatus, setPaidStatus] = useState({});
  const router = useRouter();

  const handleTogglePaid = async (e, saleId, newPaid) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents row click navigation
    if (!idToken) return;
    try {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ isPaid: newPaid }),
      });
      if (res.ok) {
        setPaidStatus((prev) => ({ ...prev, [saleId]: newPaid }));
      }
    } catch (err) {
      console.error("Failed to update payment status", err);
    }
  };

  useEffect(() => {
    const fetchSales = async (page) => {
      if (!idToken) return;
      setLoading(true);
      try {
        const authFetch = (await import("@/lib/authFetch")).default;
        const res = await authFetch(
          `/api/sales?page=${page}&limit=${ITEMS_PER_PAGE}`,
          {},
          idToken,
        );
        if (!res.ok) throw new Error("Failed to fetch sales");
        const data = await res.json();
        const formatter = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const formatted = data.sales.map((sale) => {
          let saleDate = sale.date;
          if (sale.date?._seconds) {
            const d = new Date(sale.date._seconds * 1000);
            saleDate = formatter.format(d);
          }
          return { ...sale, date: saleDate };
        });

        setSales(formatted);
        setTotalPages(Math.ceil(data.totalCount / ITEMS_PER_PAGE));
        const paidStatusFromBackend = {};
        formatted.forEach((sale) => {
          paidStatusFromBackend[sale.id] = !!sale.isPaid;
        });
        setPaidStatus(paidStatusFromBackend);
      } catch (err) {
        setSales([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSales(currentPage);
  }, [idToken, currentPage]);

  const renderPagination = () => {
    const delta = 1;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage > delta + 2) range.unshift("...");
    range.unshift(1);
    if (currentPage < totalPages - (delta + 1)) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range.map((page, idx) => (
      <button
        key={idx}
        disabled={page === "..."}
        onClick={() => typeof page === "number" && setCurrentPage(page)}
        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
          page === currentPage
            ? "bg-brand-pink text-white shadow-lg shadow-pink-500/20"
            : page === "..."
              ? "text-gray-400"
              : "bg-white dark:bg-gray-800 text-gray-500 hover:text-brand-pink border border-gray-100 dark:border-gray-700"
        }`}
      >
        {page}
      </button>
    ));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
        Syncing Ledger...
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-center md:text-left text-2xl md:text-4xl font-black tracking-tighter uppercase text-gray-900 dark:text-white italic">
              Transaction <span className="text-brand-pink">Ledger</span>
            </h1>
            <p className="text-center md:text-left text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">
              Central Revenue Audit & Invoice Stream
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-6">Date</th>
                    <th className="px-8 py-6">Invoice Number</th>
                    <th className="px-8 py-6">Customer</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Amount (Nu.)</th>
                    {/* Conditional Header for Settlement */}
                    {user?.type === "other" && (
                      <th className="px-8 py-6 text-right">Settlement</th>
                    )}
                    <th className="px-4 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      onClick={() => router.push(`/invoice/${sale.id}`)}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group cursor-pointer"
                    >
                      {/* DATE COLUMN */}
                      <td className="px-8 py-6 text-xs font-bold text-gray-500">
                        {sale.date}
                      </td>

                      {/* INVOICE NUMBER COLUMN */}
                      <td className="px-8 py-6">
                        <Link
                          href={`/invoice/${sale.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 font-black text-gray-900 dark:text-white text-sm hover:text-brand-pink transition-colors"
                        >
                          <FiFileText className="text-brand-pink" /> #
                          {sale.invoiceNumber}
                        </Link>
                      </td>

                      {/* CUSTOMER COLUMN */}
                      <td className="px-8 py-6 text-[10px] font-black text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {sale.customerName || "Walk-in Customer"}
                      </td>

                      {/* STATUS COLUMN */}
                      <td className="px-8 py-6">
                        {sale.refundStatus && sale.refundStatus !== "none" ? (
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              sale.refundStatus === "fully-refunded"
                                ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                                : "bg-amber-50 dark:bg-amber-900/20 text-amber-500"
                            }`}
                          >
                            {sale.refundStatus === "fully-refunded"
                              ? "Reversed"
                              : "Partial"}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[9px] font-black uppercase tracking-wider text-emerald-600">
                            Valid
                          </span>
                        )}
                      </td>

                      {/* AMOUNT COLUMN */}
                      <td className="px-8 py-6 text-right">
                        <p className="text-sm font-black font-mono text-gray-900 dark:text-white">
                          {sale.total?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-[8px] font-bold text-brand-pink uppercase tracking-tighter">
                          GST INCL.
                        </p>
                      </td>

                      {/* SETTLEMENT COLUMN (Conditional) */}
                      {user?.type === "other" && (
                        <td className="px-8 py-6 text-right relative z-20">
                          <div
                            className="flex items-center justify-end gap-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span
                              className={`text-[9px] font-black uppercase tracking-[0.2em] ${paidStatus[sale.id] ? "text-emerald-500" : "text-amber-500"}`}
                            >
                              {paidStatus[sale.id] ? "Paid" : "Debt"}
                            </span>
                            <button
                              onClick={(e) =>
                                handleTogglePaid(
                                  e,
                                  sale.id,
                                  !paidStatus[sale.id],
                                )
                              }
                              className={`w-10 h-5 rounded-full relative transition-all duration-300 shadow-inner ${
                                paidStatus[sale.id]
                                  ? "bg-emerald-500"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300 ${paidStatus[sale.id] ? "left-6" : "left-1"}`}
                              />
                            </button>
                          </div>
                        </td>
                      )}

                      {/* CHEVRON COLUMN (Final Polishing) */}
                      <td className="px-4 py-6 text-right">
                        <FiChevronRight className="text-gray-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="mt-12 flex items-center justify-center gap-4 no-print">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg disabled:opacity-20 hover:text-brand-pink transition-all"
          >
            <FiChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-xl">
            {renderPagination()}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg disabled:opacity-20 hover:text-brand-pink transition-all"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <PaymentStatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        paid={!!paidStatus[selectedSaleId]}
        onToggle={(val) => handleTogglePaid(selectedSaleId, val)}
      />
    </div>
  );
}
