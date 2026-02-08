"use client";
import Sidebar from "@/components/nav/Sidebar";
import PosLayout from "@/components/pos/PosLayout";
import useAuthGuard from "@/hooks/useAuthGuard";
import { SWRConfig } from "swr";
import { localStorageProvider, stablePosOptions } from "@/lib/swrConfig";

function Page() {
  const { isAuthorized, isLoading } = useAuthGuard([
    "pos",
    "restaurants",
    "hotel",
  ]);

  if (!isAuthorized) {
    return null;
  }
  return (
    <SWRConfig value={{ provider: localStorageProvider, ...stablePosOptions }}>
      <div className="h-screen">
        <Sidebar />
        <PosLayout />
      </div>
    </SWRConfig>
  );
}

export default Page;
