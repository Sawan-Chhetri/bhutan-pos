"use client";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { FiWifiOff } from "react-icons/fi";

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] animate-in slide-in-from-top duration-300">
      <div className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-2xl">
        <FiWifiOff className="animate-pulse" size={18} />
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
          Network Connection Lost - Please reconnect
        </span>
      </div>
      {/* Visual indicator for the rest of the UI */}
      <div className="h-1 bg-red-400/50 w-full overflow-hidden">
        <div className="h-full bg-white/30 animate-progress w-full origin-left" />
      </div>
    </div>
  );
}
