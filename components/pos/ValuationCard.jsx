"use client";

import { useEffect, useState } from "react";
import authFetch from "@/lib/authFetch";
import { FiTrendingUp, FiBarChart2, FiDollarSign } from "react-icons/fi";

export default function ValuationCard({ idToken }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!idToken) return;
      try {
        const res = await authFetch("/api/inventory-summary", {}, idToken);
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Fetch inventory summary failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    
    // Refresh summary every 5 minutes or on demand
    const interval = setInterval(fetchSummary, 300000);
    return () => clearInterval(interval);
  }, [idToken]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 h-32">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4" />
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
      </div>
    );
  }

  const { totalRetailValue = 0 } = summary || {};

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-950 rounded-[2rem] p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 group text-center">
      {/* Decorative background gradient */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl group-hover:bg-brand-pink/10 transition-all duration-500" />
      
      <div className="relative z-10">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="p-3 bg-brand-pink/10 rounded-2xl text-brand-pink">
            <FiBarChart2 size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
            Current Stock Valuation
          </span>
        </div>
        
        <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
          Nu. {totalRetailValue.toLocaleString()}
        </h2>
        
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Potential Revenue from Shop Inventory
        </p>
      </div>
    </div>
  );
}
