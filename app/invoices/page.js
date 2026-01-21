"use client";
import SalesScreen from "@/components/sales/SalesScreen";
import Sidebar from "@/components/nav/Sidebar";
import useAuthGuard from "@/hooks/useAuthGuard";

function Page() {
  const { isAuthorized, isLoading } = useAuthGuard(["pos", "other"]);
  if (!isAuthorized) {
    return null;
  }
  return (
    <>
      <Sidebar />
      <SalesScreen />
    </>
  );
}

export default Page;
