"use client";
import { useState, useEffect } from "react";

export function useNetworkStatus() {
  // 1. Initialize state directly to avoid calling setState in useEffect
  // We check if window exists to prevent errors during Server Side Rendering
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    // 2. We no longer need setIsOnline(navigator.onLine) here!

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []); // Dependencies remain empty as we only want to set up listeners once

  return isOnline;
}
