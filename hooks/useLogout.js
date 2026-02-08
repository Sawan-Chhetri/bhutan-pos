// hooks/useLogout.js
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import { toast } from "react-toastify";
import { clearScanCache } from "@/lib/scanCache";
import { mutate } from "swr"; // Import SWR mutate to clear SWR cache

export default function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut(auth);

      // 🧹 1. Clear LocalStorage (POS Cache & Timestamp Keys)
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("pos-cache") ||
            key.startsWith("cat_data_") ||
            key.startsWith("cat_ts_") ||
            key === "activeSessionId"
          ) {
            localStorage.removeItem(key);
          }
        });
      }

      // 🧹 2. Clear Global Scan Cache (Memory)
      clearScanCache();

      // 🧹 3. Clear SWR Cache (Memory)
      await mutate(
        () => true, // Match all keys
        undefined, // Data to set (undefined = clear?) - actually SWR doesn't have a direct clearAll
        { revalidate: false },
      );
      // Better SWR clear: Since we redirect to /login, the cache in memory is usually dropped on reload
      // But standard logout practice is clearing persistent storage.

      router.replace("/");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return logout;
}
