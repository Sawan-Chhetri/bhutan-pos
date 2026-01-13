"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";

const ITEMS_PER_PAGE = 15;

export default function SalesScreen() {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { idToken } = useAuthStatus();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async (page) => {
      if (!idToken) return;
      setLoading(true);

      try {
        const authFetch = (await import("@/lib/authFetch")).default;
        const res = await authFetch(
          `/api/sales?page=${page}&limit=${ITEMS_PER_PAGE}`,
          {},
          idToken
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
            saleDate = formatter.format(d).replace(/ /g, " ");
          }
          return { ...sale, date: saleDate };
        });

        setSales(formatted);
        setTotalPages(Math.ceil(data.totalCount / ITEMS_PER_PAGE));
      } catch (err) {
        console.error("Error fetching sales:", err);
        setSales([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchSales(currentPage);
  }, [idToken, currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700 dark:text-gray-300">
        Loading sales...
      </div>
    );
  }

  if (!sales.length) {
    return (
      <div className="p-6 text-center text-gray-700 dark:text-gray-300">
        No sales found.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
        Sales
      </h1>

      <div className="overflow-x-auto flex-1">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                Order
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                Customer
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                Total
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                Items
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="px-4 py-3 text-sm text-brand-pink dark:text-brand-pink font-medium">
                  <Link
                    href={`/invoice/${sale.id}`}
                    target="_blank"
                    className="hover:underline"
                  >
                    {sale.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                  {sale.customerName || "Walk-in Customer"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                  {sale.date}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  Nu. {sale.total.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                  {sale.items.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center flex-wrap gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded-full border transition ${
              page === currentPage
                ? "bg-brand-pink text-white border-brand-pink"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
