"use client";
import PurchaseHistory from "@/components/purchases/PurchaseHistory";
import Sidebar from "@/components/nav/Sidebar";
import useAuthGuard from "@/hooks/useAuthGuard";

function Page() {
  const { isAuthorized, isLoading } = useAuthGuard(["pos", "other", "restaurants"]);
  if (!isAuthorized) {
    return null;
  }
  return (
    <>
      <Sidebar />
      <PurchaseHistory />
    </>
  );
}

export default Page;
