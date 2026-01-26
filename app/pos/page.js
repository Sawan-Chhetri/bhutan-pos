"use client";
import Sidebar from "@/components/nav/Sidebar";
import PosLayout from "@/components/pos/PosLayout";
import useAuthGuard from "@/hooks/useAuthGuard";

function Page() {
  const { isAuthorized, isLoading } = useAuthGuard(["pos"]);

  if (!isAuthorized) {
    return null;
  }
  return (
    <div className="h-screen">
      <Sidebar />
      <PosLayout />;
    </div>
  );
}

export default Page;
