// "use client";

// import Link from "next/link";
// import { useState, useEffect, useContext } from "react";
// import { UserContext } from "@/contexts/UserContext";
// import PaymentStatusModal from "./PaymentStatusModal";
// import useAuthStatus from "@/hooks/useAuthStatus";

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
//   const [paidStatus, setPaidStatus] = useState({}); // { [saleId]: true/false }

//   // PATCH handler to update payment status in backend
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
//           idToken
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
//             saleDate = formatter.format(d).replace(/ /g, " ");
//           }
//           return { ...sale, date: saleDate };
//         });

//         setSales(formatted);
//         setTotalPages(Math.ceil(data.totalCount / ITEMS_PER_PAGE));
//         // Initialize paidStatus from backend isPaid values
//         const paidStatusFromBackend = {};
//         formatted.forEach((sale) => {
//           paidStatusFromBackend[sale.id] = !!sale.isPaid;
//         });
//         setPaidStatus(paidStatusFromBackend);
//       } catch (err) {
//         console.error("Error fetching sales:", err);
//         setSales([]);
//         setTotalPages(1);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSales(currentPage);
//   }, [idToken, currentPage]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-700 dark:text-gray-300">
//         Loading sales...
//       </div>
//     );
//   }

//   if (!sales.length) {
//     return (
//       <div className="p-6 text-center text-gray-700 dark:text-gray-300">
//         No sales found.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
//       <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
//         Sales
//       </h1>

//       <div className="overflow-x-auto flex-1">
//         <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
//           <thead className="bg-gray-100 dark:bg-gray-700">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
//                 Order
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
//                 Customer
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
//                 Date
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
//                 Total
//               </th>
//               {user?.type === "other" ? (
//                 <>
//                   <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
//                     Payment Stat
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
//                     Toggle
//                   </th>
//                 </>
//               ) : (
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
//                   Items
//                 </th>
//               )}
//             </tr>
//           </thead>
//           <tbody>
//             {sales.map((sale) => (
//               <tr
//                 key={sale.id}
//                 className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//               >
//                 <td className="px-4 py-3 text-sm text-brand-pink dark:text-brand-pink font-medium">
//                   <Link
//                     href={`/invoice/${sale.id}`}
//                     target="_blank"
//                     className="hover:underline"
//                   >
//                     {sale.invoiceNumber}
//                   </Link>
//                 </td>
//                 <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
//                   {sale.customerName || "Walk-in Customer"}
//                 </td>
//                 <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
//                   {sale.date}
//                 </td>
//                 <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
//                   Nu. {sale.total.toFixed(2)}
//                 </td>
//                 {user?.type === "other" ? (
//                   <>
//                     <td className="px-4 py-3 text-sm">
//                       <button
//                         className={`px-3 py-1 rounded-full font-semibold text-xs transition-all ${
//                           paidStatus[sale.id]
//                             ? "bg-green-100 text-green-700 border border-green-400"
//                             : "bg-yellow-100 text-yellow-700 border border-yellow-400"
//                         } hover:shadow`}
//                         onClick={() => {
//                           setSelectedSaleId(sale.id);
//                           setModalOpen(true);
//                         }}
//                       >
//                         {paidStatus[sale.id] ? "Paid" : "Unpaid"}
//                       </button>
//                     </td>
//                     <td className="px-4 py-3 text-sm">
//                       <label className="inline-flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           className="form-checkbox h-5 w-5 text-green-600"
//                           checked={!!paidStatus[sale.id]}
//                           onChange={() =>
//                             handleTogglePaid(sale.id, !paidStatus[sale.id])
//                           }
//                         />
//                         <span className="ml-2 text-sm">
//                           {paidStatus[sale.id] ? "Paid" : "Unpaid"}
//                         </span>
//                       </label>
//                     </td>
//                   </>
//                 ) : (
//                   <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
//                     {sale.items.length}
//                   </td>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <PaymentStatusModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         paid={!!paidStatus[selectedSaleId]}
//         onToggle={(val) => handleTogglePaid(selectedSaleId, val)}
//       />

//       {/* Pagination */}
//       <div className="mt-4 flex justify-center flex-wrap gap-2">
//         {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//           <button
//             key={page}
//             onClick={() => setCurrentPage(page)}
//             className={`px-3 py-1 rounded-full border transition ${
//               page === currentPage
//                 ? "bg-brand-pink text-white border-brand-pink"
//                 : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
//             }`}
//           >
//             {page}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";
import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import PaymentStatusModal from "./PaymentStatusModal";
import useAuthStatus from "@/hooks/useAuthStatus";
import {
  FiFileText,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
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

  const handleTogglePaid = async (saleId, newPaid) => {
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

  // Pagination Logic (Sliding Window)
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
      <div className="flex justify-center items-center h-screen font-black uppercase tracking-widest text-gray-400 animate-pulse">
        Syncing Sales Ledger...
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-center md:text-left text-2xl md:text-3xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">
              Invoices <span className="text-brand-pink">History</span>
            </h1>
            <p className="text-center md:text-left text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">
              Transaction Log & Revenue Tracking
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            {/* <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Order Info
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {user?.type === "other" ? "Management" : "Items"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <Link
                        href={`/invoice/${sale.id}`}
                        target="_blank"
                        className="flex items-center gap-3 group"
                      >
                        <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-brand-pink group-hover:scale-110 transition-transform">
                          <FiFileText size={16} />
                        </div>
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-brand-pink transition-colors">
                          {sale.invoiceNumber}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiUser size={14} className="opacity-50" />
                        <span className="font-medium">
                          {sale.customerName || "Walk-in"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-tight">
                        <FiCalendar size={14} />
                        {sale.date}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-baseline gap-1 text-brand-pink">
                        <span className="text-[10px] font-black uppercase">
                          Nu.
                        </span>
                        <span className="text-base font-black font-mono tracking-tighter">
                          {sale.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {user?.type === "other" ? (
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setSelectedSaleId(sale.id);
                              setModalOpen(true);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                              paidStatus[sale.id]
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}
                          >
                            {paidStatus[sale.id] ? (
                              <FiCheckCircle />
                            ) : (
                              <FiClock />
                            )}
                            {paidStatus[sale.id] ? "Paid" : "Pending"}
                          </button>

                          {/* Toggle Switch UI */}
            {/* <button
                            onClick={() =>
                              handleTogglePaid(sale.id, !paidStatus[sale.id])
                            }
                            className={`w-10 h-5 rounded-full relative transition-colors ${
                              paidStatus[sale.id]
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                                paidStatus[sale.id] ? "left-6" : "left-1"
                              }`}
                            />
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {sale.items.length} Items
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> */}
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* min-w prevents squashing */}
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  {/* Sticky Header Column */}
                  <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                    Order Info
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {user?.type === "other" ? "Management" : "Items"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Sticky Row Column */}
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-6 py-5 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                      <Link
                        href={`/invoice/${sale.id}`}
                        target="_blank"
                        className="flex items-center gap-3 group/link whitespace-nowrap"
                      >
                        <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-brand-pink">
                          <FiFileText size={16} />
                        </div>
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover/link:text-brand-pink">
                          {sale.invoiceNumber}
                        </span>
                      </Link>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiUser size={14} className="opacity-50" />
                        <span className="font-medium">
                          {sale.customerName || "Walk-in"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-tight">
                        <FiCalendar size={14} />
                        {sale.date}
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-baseline gap-1 text-brand-pink font-mono">
                        <span className="text-[10px] font-black uppercase">
                          Nu.
                        </span>
                        <span className="text-base font-black tracking-tighter">
                          {sale.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      {user?.type === "other" ? (
                        <div className="flex items-center gap-4">
                          <span
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              paidStatus[sale.id]
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}
                          >
                            {paidStatus[sale.id] ? "Paid" : "Pending"}
                          </span>
                          {/* Toggle Switch UI */}
                          <button
                            onClick={() =>
                              handleTogglePaid(sale.id, !paidStatus[sale.id])
                            }
                            className={`w-10 h-5 rounded-full relative transition-colors ${
                              paidStatus[sale.id]
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                                paidStatus[sale.id] ? "left-6" : "left-1"
                              }`}
                            />
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                          {sale.items.length} Items
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30"
          >
            <FiChevronLeft />
          </button>

          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl">
            {renderPagination()}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30"
          >
            <FiChevronRight />
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
