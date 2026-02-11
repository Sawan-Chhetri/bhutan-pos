"use client";

import Link from "next/link";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center selection:bg-[#EE4B6A]/30">
      <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-3xl flex items-center justify-center mb-8 animate-bounce border border-red-100 dark:border-red-900/20">
        <FiAlertTriangle className="text-4xl text-[#EE4B6A]" />
      </div>

      <h1 className="text-8xl md:text-9xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter loading-none">
        404
      </h1>

      <p className="text-sm md:text-base font-black text-[#EE4B6A] uppercase tracking-[0.3em] mb-6">
        Dead End Detected
      </p>

      <div className="h-1 w-20 bg-slate-100 dark:bg-gray-800 mx-auto mb-8 rounded-full"></div>

      <p className="text-slate-500 dark:text-gray-400 font-medium text-lg max-w-md mb-12 leading-relaxed">
        We searched purely everywhere, but this page seems to be written off or
        moved.
      </p>

      <Link
        href="/"
        className="group px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-2xl shadow-slate-200 dark:shadow-none"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
        Back to Home
      </Link>
    </div>
  );
}
