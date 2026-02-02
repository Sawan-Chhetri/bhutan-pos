"use client";
import { FiAlertTriangle, FiPhone, FiMail } from "react-icons/fi";
import useLogout from "@/hooks/useLogout";

export default function LicenseExpiredPage() {
  const logout = useLogout();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiAlertTriangle size={40} />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
          License Expired
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
          Your access to the SwiftGST system has been suspended because your license is no longer active.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8 text-left space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Support</h3>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-bold">
                <FiPhone className="text-brand-pink" />
                <span>+975 17 00 00 00</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-bold">
                <FiMail className="text-brand-pink" />
                <span>support@swiftgstbhutan.com</span>
            </div>
        </div>

        <button
          onClick={logout}
          className="w-full bg-gray-900 dark:bg-brand-pink text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
