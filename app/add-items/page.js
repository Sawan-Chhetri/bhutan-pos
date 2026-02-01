"use client";
import ItemsLayout from "@/components/add-item/ItemsLayout";
import Sidebar from "@/components/nav/Sidebar";
import { useContext, useEffect } from "react";
import { UserContext } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import useAuthGuard from "@/hooks/useAuthGuard";

function AddItemsPage() {
  // Check auth
  const { isAuthorized, isLoading } = useAuthGuard(["pos", "restaurants"]);
  const { user } = useContext(UserContext);
  const router = useRouter();
  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <ItemsLayout />
    </>
  );
}

export default AddItemsPage;
