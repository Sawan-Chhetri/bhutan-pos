"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvoicePage() {
  const { id } = useParams();
  //   const [invoice, setInvoice] = useState(null);

  // Mock business details (later from DB / settings)
  const business = {
    name: "Bhutan POS Store",
    address: "Norzin Lam, Thimphu, Bhutan",
    phone: "+975 17 123 456",
  };

  const mockData = {
    id: 1,
    order: "ORD-001",
    customer: "John Doe",
    date: "2026-01-07",
    subtotal: 428.57,
    gst: 21.43,
    total: 450,
    items: [
      { name: "Veg Pasta", qty: 2, price: 180 },
      { name: "Cold Coffee", qty: 1, price: 90 },
    ],
  };
  const invoice = Number(id) === mockData.id ? mockData : null;
  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  if (!invoice) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-400">
        Loading invoice...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4 mb-6 dark:border-gray-700">
          {/* Business Info */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {business.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {business.address}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Phone: {business.phone}
            </p>
          </div>

          {/* Invoice Meta */}
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tax Invoice
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Order: {invoice.order}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Date: {invoice.date}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Bill To
          </h3>
          <p className="text-gray-900 dark:text-white font-medium">
            {invoice.customer}
          </p>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Item
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Qty
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Price
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.qty}</td>
                  <td className="px-4 py-3">₹{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 font-medium">
                    ₹{(item.qty * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Subtotal</span>
            <span>₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>GST</span>
            <span>₹{invoice.gst.toFixed(2)}</span>
          </div>
          <hr className="border-gray-300 dark:border-gray-600" />
          <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>₹{invoice.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Thank you for shopping with {business.name}
        </div>
      </div>
    </div>
  );
}
