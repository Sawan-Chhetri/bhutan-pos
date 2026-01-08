"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStatus from "./useAuthStatus"; // Update path if needed

export default function useRequireAuth(redirectTo = "/login") {
  const { loggedIn, checkingStatus } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (!checkingStatus && !loggedIn) {
      router.push(redirectTo);
    }
  }, [checkingStatus, loggedIn, router, redirectTo]);

  return { loggedIn, checkingStatus };
}
