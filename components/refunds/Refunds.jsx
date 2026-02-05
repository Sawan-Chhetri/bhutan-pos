"use client";
import { useEffect, useState } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiFileText, FiChevronRight, FiChevronLeft } from "react-icons/fi";

const ITEMS_PER_PAGE = 20;

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({ totalReversed: 0, gstReclaimed: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { idToken } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (!idToken) return;

    const fetchRefunds = async (page) => {
      setLoading(true);
      try {
        const authFetch = (await import("@/lib/authFetch")).default;
        const res = await authFetch(
          `/api/refunds?page=${page}&limit=${ITEMS_PER_PAGE}`,
          {},
          idToken,
        );
        const json = await res.json();

        setRefunds(json.refunds);
        setStats(json.stats);
        setTotalPages(Math.ceil(json.totalCount / ITEMS_PER_PAGE));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds(currentPage);
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
              ? "text-gray-400 cursor-default"
              : "bg-white dark:bg-gray-800 text-gray-500 hover:text-brand-pink border border-gray-100 dark:border-gray-700"
        }`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="p-4 md:p-12 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header & Stats Code stays the same... */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase dark:text-white italic">
              Refund <span className="text-brand-pink">Ledger</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">
              Refund & Reversal Audit
            </p>
          </div>
          {/* <div className="flex gap-4">
            <StatCard
              label="Total Reversed"
              value={stats.totalReversed}
              color="text-gray-900"
            />
            <StatCard
              label="GST Reclaimed"
              value={stats.gstReclaimed}
              color="text-brand-pink"
            />
          </div> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64 font-black uppercase tracking-widest text-gray-400 animate-pulse">
            Syncing Audit Trail...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6">CN Number</th>
                  <th className="px-8 py-6">Original INV</th>
                  <th className="px-8 py-6">Reason</th>
                  <th className="px-8 py-6 text-right">Amount (Nu.)</th>
                  <th className="px-4 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {refunds.map((ref) => (
                  <tr
                    key={ref.id}
                    onClick={() => router.push(`/refunds/${ref.id}`)}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-6 text-xs font-bold text-gray-500">
                      {new Date(ref.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-black text-gray-900 dark:text-white text-sm">
                        <FiFileText className="text-brand-pink" />{" "}
                        {ref.refundInvoiceNumber}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[14px] font-black text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      #{ref.originalInvoiceNumber}
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[9px] font-black uppercase tracking-wider text-gray-500">
                        {ref.reason}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-sm font-black font-mono text-gray-900 dark:text-white">
                        -
                        {ref.totalAmount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-6 text-right">
                      <FiChevronRight className="text-gray-200 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
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
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm min-w-[180px]">
      <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <p
        className={`text-xl font-black font-mono tracking-tighter ${color} dark:text-white italic`}
      >
        Nu. {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}
