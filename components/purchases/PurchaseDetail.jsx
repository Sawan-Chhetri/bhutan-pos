"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiPrinter,
  FiShield,
  FiPackage,
  FiTruck,
  FiHash,
  FiCalendar,
} from "react-icons/fi";
import useAuthStatus from "@/hooks/useAuthStatus";
import Link from "next/link";

export default function PurchaseDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { idToken } = useAuthStatus();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idToken || !id) return;

    const fetchDetail = async () => {
      try {
        const authFetch = (await import("@/lib/authFetch")).default;
        const res = await authFetch(`/api/purchases/${id}`, {}, idToken);
        if (res.ok) {
          const data = await res.json();
          setPurchase(data);
        }
      } catch (err) {
        console.error("Failed to load purchase voucher");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [idToken, id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-[0.4em] text-blue-600 animate-pulse">
        Retrieving Voucher...
      </div>
    );

  if (!purchase)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="font-black text-gray-400 uppercase tracking-widest">
          Record Not Found
        </p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 font-bold uppercase text-xs flex items-center gap-2"
        >
          <FiArrowLeft /> Go Back
        </button>
      </div>
    );

  const formattedDate = new Date(purchase.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12 print:p-0">
      {/* 1. TOP NAVIGATION (Hidden on Print) */}
      <nav className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <Link
          href="/purchase-history"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-pink transition-colors"
        >
          <FiArrowLeft /> Back to Purchases
        </Link>
        <button
          onClick={() => window.print()}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-blue-500/20"
        >
          <FiPrinter size={16} /> Print Voucher
        </button>
      </nav>

      {/* 2. THE VOUCHER CARD */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600" />

        <div className="p-8 md:p-16">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                <FiShield /> BRS Compliance Record
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic text-gray-900 dark:text-white">
                Purchase <span className="text-blue-600">Invoice</span>
              </h1>
              <div className="flex items-center gap-4 mt-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <span className="flex items-center gap-1">
                  <FiCalendar className="text-blue-500" /> {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <FiHash className="text-blue-500" /> Invoice:{" "}
                  {purchase.billNumber}
                </span>
              </div>
            </div>

            <div className="text-right bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                Supplier Details
              </p>
              <p className="text-xl font-black uppercase text-gray-900 dark:text-white">
                {purchase.supplierName}
              </p>
              <p className="text-sm font-mono font-bold text-blue-600">
                GST TPN: {purchase.supplierTIN}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-12 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Items / Stock
                  </th>
                  <th className="pb-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Qty
                  </th>
                  <th className="pb-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Rate
                  </th>
                  <th className="pb-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {purchase.cartItems?.map((item, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-6">
                      <p className="font-black text-gray-900 dark:text-white uppercase">
                        {item.name}
                      </p>
                      {item.isTaxable && (
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">
                          5% GST Applied
                        </span>
                      )}
                    </td>
                    <td className="py-6 text-center font-mono font-bold text-gray-500">
                      {item.qty}
                    </td>
                    <td className="py-6 text-right font-mono font-bold text-gray-500">
                      Nu. {item.cost.toLocaleString()}
                    </td>
                    <td className="py-6 text-right font-mono font-black text-gray-900 dark:text-white">
                      Nu. {item.lineTotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="bg-gray-900 dark:bg-blue-600 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
            <div className="flex gap-12 text-white">
              <div>
                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">
                  Net Expense
                </p>
                <p className="text-2xl font-black font-mono">
                  Nu. {purchase.totalPurchases?.toLocaleString()}
                </p>
              </div>
              <div className="border-l border-white/10 pl-12">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">
                  Input Credit (ITC)
                </p>
                <p className="text-2xl font-black font-mono text-white">
                  Nu. {purchase.itc?.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12">
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1 text-white">
                Total Value
              </p>
              <p className="text-5xl font-black tracking-tighter text-white font-mono leading-none">
                Nu. {(purchase.totalPurchases + purchase.itc).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="mt-16 pt-8 border-t border-dashed border-gray-100 dark:border-gray-800 flex justify-between items-center opacity-50">
            <p className="text-[9px] font-black uppercase tracking-widest italic">
              Digital Record • Generated by SwiftGST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
