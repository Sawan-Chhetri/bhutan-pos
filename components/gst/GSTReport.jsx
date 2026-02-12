"use client";
import { useEffect, useState } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import {
  FiShield,
  FiPrinter,
  FiBriefcase,
  FiArrowLeft,
  FiPlusCircle,
  FiMinusCircle,
  FiRefreshCcw,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";
import Link from "next/link";

export default function GSTReport({ month }) {
  const [report, setReport] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const { idToken } = useAuthStatus();

  // Check if report month has ended
  const [rYear, rMonth] = month ? month.split("-").map(Number) : [0, 0];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isMonthEnded =
    rYear < currentYear || (rYear === currentYear && rMonth < currentMonth);

  const handleGenerateReports = async () => {
    setGenerating(true);
    try {
      const authFetch = (await import("@/lib/authFetch")).default;
      const res = await authFetch(
        `/api/gst-reports/generate?targetMonth=${month}`,
        {},
        idToken,
      );
      if (!res.ok) throw new Error("Failed to generate report");

      // Re-fetch report data immediately
      const reportRes = await authFetch(
        `/api/gst-reports/${month}`,
        {},
        idToken,
      );
      if (reportRes.ok) {
        const data = await reportRes.json();
        // Update local state smoothly
        updateReportState(data);
      } else {
        window.location.reload();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const updateReportState = (data) => {
    const generatedOn = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());

    const [year, monthNum] = data.month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const now = new Date();
    let endDate =
      year === now.getFullYear() && monthNum === now.getMonth() + 1
        ? now
        : new Date(year, monthNum, 0);

    const formatter = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const monthLabel = `${formatter.format(startDate)} - ${formatter.format(
      endDate,
    )}`;

    setReport({ ...data, monthLabel, generatedOn });
    // Business state update omitted as it rarely changes
  };

  useEffect(() => {
    if (!idToken || !month) return;

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const authFetch = (await import("@/lib/authFetch")).default;
        const res = await authFetch(`/api/gst-reports/${month}`, {}, idToken);

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch GST report");
        }

        const data = await res.json();
        updateReportState(data); // Reused logic

        setBusiness({
          name: data.business?.name || "Bhutan POS Enterprise",
          tpn: data.business?.gstNumber || "TPN PENDING",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [month, idToken]);

  if (loading || !report)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950 text-center font-black uppercase tracking-[0.3em] text-gray-400">
        Verifying Tax Records...
      </div>
    );

  // 🧮 INDUSTRIAL RECONCILIATION MATH
  const netOutput = report.gstCollected - (report.gstRefunded || 0);
  const netPayable = netOutput - (report.itcClaimed || 0);

  return (
    <div className="p-4 md:p-12 bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col items-center">
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.8cm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          /* Adjusted Print Styles */
          .report-card {
            box-shadow: none !important;
            border: 1px solid #000 !important;
            margin: 0 !important;
            border-radius: 0 !important;
            padding: 1rem !important; /* Reduced padding */
          }
          /* Reduce spacing between elements for print */
          .p-8,
          .p-14,
          .mb-10,
          .pb-8,
          .mb-8,
          .gap-8 {
            margin-bottom: 0.5rem !important;
            padding-bottom: 0.5rem !important;
            gap: 0.5rem !important;
          }
          /* Hide Compliance Shield on print to save space if needed, or make it smaller */
          .compliance-shield {
            padding: 0.5rem !important;
            margin-bottom: 0.5rem !important;
          }
          /* Force single page */
          html,
          body {
            height: 100%;
            overflow: hidden;
          }
          .min-h-screen {
            min-height: auto !important;
          }
        }
      `}</style>

      {/* Action Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8 print:hidden">
        <Link
          href="/gst-reports"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-pink transition-colors"
        >
          <FiArrowLeft /> Back to Analytics
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white dark:bg-gray-900 px-6 py-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest hover:text-brand-pink transition-all active:scale-95"
        >
          <FiPrinter size={16} /> Print Official Report
        </button>
      </div>

      <div className="report-card bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        <div className="h-3 bg-gray-900 dark:bg-brand-pink w-full" />

        <div className="p-8 md:p-14">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 pb-8 border-b-2 border-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-900 text-white rounded-2xl">
                <FiBriefcase size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter uppercase dark:text-white leading-none">
                  {business.name}
                </h1>
                <p className="text-[9px] font-bold text-brand-pink uppercase tracking-widest mt-1">
                  TPN: {business.tpn}
                </p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase mb-1">
                GST Settlement
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                {report.monthLabel}
              </p>
            </div>
          </div>

          {/* GST Pack Downloads */}
          <div className="mb-8 print:hidden">
            {report.files ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DownloadCard
                  label="Output GST (Sales)"
                  file={report.files.outputGst}
                />
                <DownloadCard
                  label="Input GST (Purchases)"
                  file={report.files.inputGst}
                />
                <DownloadCard label="Refunds" file={report.files.refunds} />
              </div>
            ) : (
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center text-center">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Official Tax Filing Data Not Generated
                </p>
                {isMonthEnded ? (
                  <>
                    <button
                      onClick={handleGenerateReports}
                      disabled={generating}
                      className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiRefreshCw
                        className={generating ? "animate-spin" : ""}
                      />
                      {generating ? "Generating..." : "Generate GST Pack"}
                    </button>
                    <p className="mt-2 text-[7px] text-gray-400">
                      Finalize monthly records for tax filing
                    </p>
                  </>
                ) : (
                  <div className="px-5 py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-lg text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-1 cursor-not-allowed">
                    <span className="flex items-center gap-2">
                      <FiRefreshCw /> Report Locked
                    </span>
                    <span className="text-[8px] font-normal normal-case opacity-70">
                      Available from 1st of next month
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Compliance Shield */}
          <div className="compliance-shield flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-8 border border-gray-200 dark:border-gray-700">
            <FiShield size={20} className="text-green-600 shrink-0" />
            <p className="text-[8px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
              Consolidated BRS Report: This document reconciles Total Output
              Tax, Credit Note Adjustments, and Input Tax Credits (ITC) for the
              specified period.
            </p>
          </div>

          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 print:grid-cols-3 print:gap-2">
            <SummaryItemCount
              label="Sales"
              value={report.saleCount}
              icon={<FiPlusCircle size={10} />}
            />
            <SummaryItemCount
              label="Refunds"
              value={report.refundCount || 0}
              icon={<FiRefreshCcw size={10} />}
            />
            <SummaryItemCount
              label="Purchases"
              value={report.purchaseCount || 0}
              icon={<FiMinusCircle size={10} />}
            />

            <SummaryItem
              label="Output Tax"
              value={report.gstCollected}
              isBold
            />
            <SummaryItem
              label="Tax Refunded"
              value={report.gstRefunded || 0}
              isPink
            />
            <SummaryItem
              label="Input Credit"
              value={report.itcClaimed || 0}
              isBlue
            />
          </div>

          {/* Detailed Reconciliation Table (Minimalist) */}
          <div className="mb-8 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden print:mb-4">
            <table className="w-full text-[9px] font-bold uppercase tracking-widest print:text-[8px]">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left print:py-1">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right print:py-1">
                    Amount (Nu.)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                <tr>
                  <td className="px-6 py-4 print:py-2">
                    Total GST Collected on Sales
                  </td>
                  <td className="px-6 py-4 text-right font-mono print:py-2">
                    +
                    {report.gstCollected.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-brand-pink">
                    Less: GST on Returns (Credit Notes)
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-brand-pink">
                    -
                    {(report.gstRefunded || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr className="bg-gray-50/50 dark:bg-gray-800/20">
                  <td className="px-6 py-4 font-black">Adjusted Output GST</td>
                  <td className="px-6 py-4 text-right font-black font-mono underline decoration-double">
                    {netOutput.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-blue-500">
                    Less: Input Tax Credit (ITC)
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-blue-500">
                    -
                    {(report.itcClaimed || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Final Settlement Section */}
          <div
            className={`liability-card relative rounded-3xl p-10 overflow-hidden transition-colors border-2 ${netPayable > 0 ? "bg-gray-900 border-gray-900" : "bg-green-600 border-green-600"}`}
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em] mb-3">
                {netPayable > 0
                  ? "Final Tax Liability"
                  : "Tax Carry Forward Amount"}
              </h3>
              <p className="text-6xl font-black text-white tracking-tighter font-mono italic leading-none">
                Nu.
                {Math.abs(netPayable).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center opacity-40 italic">
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
              {report.month}-{report.saleCount}-{report.refundCount}
            </p>
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
              SwiftGST • {report.generatedOn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, isBold, isPink, isBlue }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-0.5">
        <span
          className={`text-[8px] font-black ${isPink ? "text-brand-pink" : isBlue ? "text-blue-500" : "text-gray-300"}`}
        >
          Nu.
        </span>
        <span
          className={`text-lg font-black font-mono tracking-tighter ${isBold ? "text-gray-900 dark:text-white" : isPink ? "text-brand-pink" : isBlue ? "text-blue-500" : "text-gray-600 dark:text-gray-400"}`}
        >
          {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

function SummaryItemCount({ label, value, icon }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border border-transparent rounded-2xl flex justify-between items-start">
      <div>
        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <span className="text-lg font-black font-mono text-gray-900 dark:text-white">
          {value}
        </span>
      </div>
      <div className="text-gray-300">{icon}</div>
    </div>
  );
}

function DownloadCard({ label, file }) {
  if (!file) return null;
  const url = typeof file === "string" ? file : file?.url;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-brand-pink transition-colors print:hidden"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 group-hover:text-brand-pink group-hover:bg-brand-pink/10 transition-colors">
          <FiDownload size={14} />
        </div>
      </div>
      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">
        Download CSV
      </p>
      <p className="text-xs font-black font-mono text-gray-900 dark:text-white uppercase truncate">
        {label}
      </p>
    </a>
  );
}
