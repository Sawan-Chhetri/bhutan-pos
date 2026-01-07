"use client";

import Link from "next/link";
import { useState } from "react";

export default function SalesScreen() {
  const [sales, setSales] = useState([
    {
      id: 1,
      order: "ORD-001",
      customer: "John Doe",
      date: "2026-01-07",
      total: 450,
      subtotal: 428.57,
      gst: 21.43,
      items: 3,
    },
    {
      id: 2,
      order: "ORD-002",
      customer: "Jane Smith",
      date: "2026-01-07",
      total: 230,
      subtotal: 219.05,
      gst: 10.95,
      items: 2,
    },
  ]);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
        Sales
      </h1>

      <div className="overflow-x-auto">
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
                <td className="px-4 py-3 text-sm text-amber-500 dark:text-amber-400 font-medium">
                  <Link href={`/invoice/${sale.id}`}>{sale.order}</Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                  {sale.customer}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                  {sale.date}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  ₹{sale.total.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                  {sale.items}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
