"use client";

import { useEffect, useState } from "react";

export default function GSTReport({ month }) {
  //   const [report, setReport] = useState(null);

  // Business details (later from settings / DB)
  const business = {
    name: "Bhutan POS Store",
    address: "Norzin Lam, Thimphu, Bhutan",
    phone: "+975 17 123 456",
  };

  //   useEffect(() => {
  //     // Mock data – replace with API later
  //     const mockReport = {
  //       monthLabel: "January 2026",
  //       generatedOn: "2026-01-31",
  //       totalSales: 124560,
  //       totalOrders: 342,
  //       taxableSales: 118500,
  //       gstCollected: 6228,
  //     };

  //     setReport(mockReport);
  //   }, [month]);

  // Mock data – replace with API later
  const mockReport = {
    monthLabel: "January 2026",
    generatedOn: "2026-01-31",
    totalSales: 124560,
    totalOrders: 342,
    taxableSales: 118500,
    gstCollected: 6228,
  };

  const report = mockReport;

  if (!report) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-400">
        Loading GST report...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4 mb-6 dark:border-gray-700">
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

          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              GST Summary Report
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Month: {report.monthLabel}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generated on: {report.generatedOn}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4 mb-6">
          <SummaryRow
            label="Total Sales"
            value={`₹${report.totalSales.toLocaleString()}`}
          />
          <SummaryRow
            label="Total Sales Count"
            value={`${report.totalOrders} Orders`}
          />
          <SummaryRow
            label="Taxable Sales"
            value={`₹${report.taxableSales.toLocaleString()}`}
          />
          <SummaryRow
            label="GST Collected"
            value={`₹${report.gstCollected.toLocaleString()}`}
          />
        </div>

        {/* GST Owed */}
        <div className="border-t pt-6 dark:border-gray-700">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              GST Owed for {report.monthLabel}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              ₹{report.gstCollected.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          This is a system-generated GST summary report.
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
