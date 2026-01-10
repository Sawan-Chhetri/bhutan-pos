"use client";

import { useEffect, useState } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";

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
        const res = await fetch(`/api/gst-reports/${month}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch GST report");
        }

        const data = await res.json();

        // Format generated date
        const generatedOn = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date());

        // setReport({
        //   ...data,
        //   monthLabel: data.month,
        //   generatedOn,
        // });
        // Parse year and month from API (format: "YYYY-MM")
        const [year, monthNum] = data.month.split("-").map(Number);

        // Get start of month
        const startDate = new Date(year, monthNum - 1, 1);

        // Get end of month (or today if current month)
        const now = new Date();
        let endDate;
        if (year === now.getFullYear() && monthNum === now.getMonth() + 1) {
          endDate = now; // current month → use today
        } else {
          // last day of month
          endDate = new Date(year, monthNum, 0); // day 0 of next month → last day
        }

        // Format dates as "DD MMM YYYY"
        const formatter = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const monthLabel = `${formatter.format(startDate)} - ${formatter.format(
          endDate
        )}`;

        setReport({
          ...data,
          monthLabel,
          generatedOn,
        });

        setBusiness({
          name: data.business?.name || "-",
          phone: data.business?.phone || "-",
          address: data.business?.address || "-",
        });
      } catch (err) {
        console.error("GST report fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [month, idToken]);

  if (loading)
    return (
      <div className="p-6 text-gray-500 dark:text-gray-400 text-center">
        Loading GST report...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-red-500 dark:text-red-400 text-center">
        {error}
      </div>
    );
  if (!report || !business)
    return (
      <div className="p-6 text-gray-500 dark:text-gray-400 text-center">
        No report found.
      </div>
    );

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
            label="Total Orders"
            value={`${report.totalOrders} Order${
              report.totalOrders > 1 ? "s" : ""
            }`}
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
