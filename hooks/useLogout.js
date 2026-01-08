// hooks/useLogout.js
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import { toast } from "react-toastify";

export default function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return logout;
}
