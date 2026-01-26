"use client";
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiCalendar,
  FiArrowLeft,
  FiArrowRight,
  FiTruck,
  FiHash,
} from "react-icons/fi";
import useAuthStatus from "@/hooks/useAuthStatus";

// Constants for pagination
const ITEMS_PER_PAGE = 10;

export default function PurchaseHistory() {
  const { idToken } = useAuthStatus();

  // --- STATE ---
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPurchases = async (page) => {
      if (!idToken) return;
      setLoading(true);
      try {
        const authFetch = (await import("@/lib/authFetch")).default;
        // Fetching with pagination and search params
        const res = await authFetch(
          `/api/purchases?page=${page}&limit=${ITEMS_PER_PAGE}`,
          {},
          idToken,
        );

        if (!res.ok) throw new Error("Failed to fetch purchases");

        const data = await res.json();

        const formatter = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const formatted = data.purchases.map((purchase) => {
          let purchaseDate = purchase.date;
          // Handle Firestore Timestamp vs ISO String
          if (purchase.date?._seconds) {
            const d = new Date(purchase.date._seconds * 1000);
            purchaseDate = formatter.format(d);
          } else if (purchase.date) {
            purchaseDate = formatter.format(new Date(purchase.date));
          }

          return { ...purchase, formattedDate: purchaseDate };
        });

        setPurchases(formatted);
        setTotalPages(Math.ceil((data.totalCount || 0) / ITEMS_PER_PAGE));
      } catch (err) {
        console.error("Error loading purchase history:", err);
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases(currentPage);
  }, [idToken, currentPage]);

  // Pagination UI Generator
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
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            : page === "..."
              ? "text-gray-400"
              : "bg-white text-gray-500 hover:text-blue-600 border border-gray-100"
        }`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header & Search */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl text-center md:text-4xl md:text-left font-black tracking-tighter uppercase">
              Purchase <span className="text-blue-600">History</span>
            </h1>
            <p className="text-[10px] text-center md:text-left font-bold text-gray-400 uppercase tracking-[0.4em] mt-1">
              Input Tax Credit Records
            </p>
          </div>

          {/* <div className="relative group w-full md:w-96">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search Supplier or Bill #"
              className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-100 uppercase text-[10px] font-black tracking-widest outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
            />
          </div> */}
        </header>

        {/* List Content */}
        {loading ? (
          <div className="p-20 text-center font-black uppercase tracking-widest animate-pulse text-blue-600">
            Loading Ledger...
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              No records found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white dark:bg-gray-900 rounded-[2rem] p-5 md:p-7 border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* 1. VENDOR ICON & INFO */}
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                      <FiTruck size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                          {purchase.supplierName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <FiHash className="text-blue-500" />{" "}
                          {purchase.billNumber}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <FiCalendar className="text-blue-500" />{" "}
                          {purchase.formattedDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. FINANCIAL STATS */}
                  <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50 dark:border-gray-800">
                    {/* Total Cost Section */}
                    <div className="text-left md:text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Total Bill
                      </p>
                      <p className="text-xl font-mono font-black text-gray-900 dark:text-white">
                        Nu.{" "}
                        {Number(purchase.totalPurchases || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* ITC Section (Equivalent to 'GST Collected' in Invoice History) */}
                    <div className="text-left md:text-right">
                      <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">
                        Tax Credit
                      </p>
                      <p className="text-xl font-mono font-black text-blue-600">
                        Nu. {Number(purchase.itc || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* VIEW ACTION (Matches your Invoice 'View' button style) */}
                    <button
                      onClick={() =>
                        window.open(
                          `/purchase-history/${purchase.id}`,
                          "_blank",
                        )
                      }
                      className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-blue-500/20"
                    >
                      <FiArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FiArrowLeft />
                </button>

                {renderPagination()}

                <button
                  disabled={currentPage >= totalPages} // Use >= for safety
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FiArrowRight />
                </button>
              </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
