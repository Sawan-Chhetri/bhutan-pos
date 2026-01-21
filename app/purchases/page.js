"use client";
import Sidebar from "@/components/nav/Sidebar";
import PurchaseLedger from "@/components/purchases/PurchaseLedger";
import useAuthGuard from "@/hooks/useAuthGuard";
function Page() {
  const { isAuthorized, isLoading } = useAuthGuard(["pos", "other"]);
  if (!isAuthorized) {
    return null;
  }
  return (
    <>
      <Sidebar />
      <PurchaseLedger />
    </>
  );
}

export default Page;
