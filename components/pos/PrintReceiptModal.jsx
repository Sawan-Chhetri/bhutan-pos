"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import Receipt80mm from "@/components/receipt/Receipt80mm";
import { FiPrinter, FiEye, FiCheckCircle, FiLoader } from "react-icons/fi";

export default function PrintReceiptModal({ isOpen, onClose, saleId }) {
  const router = useRouter();
  const { idToken } = useAuthStatus();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !saleId || !idToken) return;

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`/api/sales/${saleId}`, {}, idToken);
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const data = await res.json();
        
        // Date formatting logic (reused from InvoicePage)
        const formatter = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        let saleDate = data.date;
        if (data.date?._seconds) {
          const d = new Date(data.date._seconds * 1000);
          saleDate = formatter.format(d);
        }
        
        const fetchedInvoice = { ...data, date: saleDate };
        setInvoice(fetchedInvoice);
        console.log("✅ Receipt Data Loaded:", saleId);
        // console.log(fetchedInvoice); // Debugging
      } catch (err) {
        console.error("❌ Print Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [isOpen, saleId, idToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 print:bg-white print:backdrop-blur-none">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] shadow-2xl p-8 border border-gray-100 dark:border-gray-800 flex flex-col items-center print:shadow-none print:border-none print:p-0 print:w-auto print:max-w-none print:rounded-none">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 print:hidden">
          <FiCheckCircle className="text-green-500" size={32} />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2 print:hidden">
          Payment Success
        </h2>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 text-center uppercase tracking-widest print:hidden">
          Transaction Complete
        </p>

        <div className="flex flex-col gap-3 w-full print:hidden">
          <button
            disabled={loading || !invoice}
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#8bc36d] text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiPrinter size={18} />}
            Print Receipt
          </button>

          <button
            onClick={onClose}
            className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-brand-pink transition-colors"
          >
            Close & New Sale
          </button>
        </div>

        {/* Hidden Thermal Receipt Component */}
        {invoice && <Receipt80mm invoice={invoice} />}
      </div>
    </div>
  );
}

