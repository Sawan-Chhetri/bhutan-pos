"use client";

import { useEffect, useState } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import {
  FiAlertCircle,
  FiClipboard,
  FiPrinter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

export default function ShoppingListScreen() {
  const { user, idToken } = useAuthStatus();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!idToken) return;

    const fetchLowStock = async () => {
      setLoading(true);
      try {
        const res = await authFetch(
          `/api/read-low-stock-items?page=${currentPage}&limit=20`,
          {},
          idToken,
        );
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch shopping list", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, [idToken, currentPage]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-pink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <FiClipboard className="text-brand-pink" />
              SHOPPING LIST
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-widest">
              Items requiring restocking
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xl hover:scale-105 transition-transform print:hidden"
          >
            <FiPrinter size={16} /> Print List
          </button>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          {items.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClipboard size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                All Stocked Up!
              </h3>
              <p className="text-gray-500">
                There are no items below minimum stock levels.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <div className="col-span-6">Item Detail</div>
                <div className="col-span-2 text-center">Current</div>
                <div className="col-span-2 text-center">Min Req</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 md:p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  {/* Product Info */}
                  <div className="col-span-6">
                    <p className="font-bold text-gray-900 dark:text-white text-lg md:text-base">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 uppercase">
                        {item.category}
                      </span>
                      {item.barcode && (
                        <span className="text-[10px] font-mono text-gray-400">
                          SKU: {item.barcode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Levels (Mobile: Flex, Desktop: Grid) */}
                  <div className="col-span-6 md:col-span-6 flex justify-between md:grid md:grid-cols-6 items-center w-full">
                    {/* Current Stock */}
                    <div className="md:col-span-2 text-center">
                      <span className="md:hidden text-xs font-bold text-gray-400 uppercase mr-2">
                        Stock:
                      </span>
                      <span className="text-xl font-mono font-black text-red-500">
                        {item.stock}
                        {item.unitType === "default" ? "" : ` ${item.unitType}`}
                      </span>
                    </div>

                    {/* Min Stock */}
                    <div className="md:col-span-2 text-center">
                      <span className="md:hidden text-xs font-bold text-gray-400 uppercase mr-2">
                        Min:
                      </span>
                      <span className="text-base font-mono font-bold text-gray-400">
                        {item.minStock}
                        {item.unitType === "default" ? "" : ` ${item.unitType}`}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="md:col-span-2 text-right">
                      {item.stock === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls - Print Hidden */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 print:hidden">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-20 hover:border-brand-pink transition-colors"
            >
              <FiChevronLeft className="dark:text-white" />
            </button>

            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-20 hover:border-brand-pink transition-colors"
            >
              <FiChevronRight className="dark:text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
