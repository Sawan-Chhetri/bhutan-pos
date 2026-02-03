"use client";

import Sidebar from "@/components/nav/Sidebar";
import useAuthGuard from "@/hooks/useAuthGuard";
import ValuationCard from "@/components/pos/ValuationCard";
import useAuthStatus from "@/hooks/useAuthStatus";
import { FiTrendingUp } from "react-icons/fi";

export default function InventoryValuationPage() {
  const { isAuthorized } = useAuthGuard(["pos", "admin"]);
  const { idToken } = useAuthStatus();

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="pl-0 md:pl-20 pt-20 p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
              <div className="p-3 bg-brand-pink text-white rounded-2xl shadow-lg shadow-pink-500/20">
                <FiTrendingUp size={28} />
              </div>
              Inventory Valuation
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-4 ml-1">
              Real-time analysis of your current stock value
            </p>
          </header>

          <div className="grid gap-8">
            <ValuationCard idToken={idToken} />
            
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/10">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6">
                Understanding Your Valuation
              </h3>
              <div className="space-y-6 text-gray-500 dark:text-gray-400 font-medium">
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-pink mt-2 shrink-0" />
                  <p>
                    <strong className="text-gray-900 dark:text-white">Total Valuation</strong> is calculated based on the selling price of all items currently in stock. This represents the maximum potential revenue you can generate from your existing inventory.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-pink mt-2 shrink-0" />
                  <p>
                    The value is adjusted automatically in real-time. When you <strong className="text-gray-900 dark:text-white">Record a Purchase</strong>, the valuation increases. When you complete a <strong className="text-gray-900 dark:text-white">Checkout</strong>, it decreases.
                  </p>
                </div>
              </div>
              
              <div className="mt-10 p-6 bg-brand-pink/5 dark:bg-brand-pink/10 rounded-3xl border border-brand-pink/10">
                <p className="text-brand-pink text-sm font-black uppercase tracking-widest">
                  Valuation = ∑ (Stock on Hand × Selling Price)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
