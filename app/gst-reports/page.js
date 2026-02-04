"use client";
import GSTReports from "@/components/gst/GSTReports";
import Sidebar from "@/components/nav/Sidebar";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function GSTReportPage() {
  const { isAuthorized, isLoading } = useAuthGuard(["pos", "other", "restaurants", "hotel"]);

  if (isLoading) return <div className="p-10">Loading auth...</div>;
  if (!isAuthorized) {
    return null;
  }
  return (
    <>
      <Sidebar />
      <GSTReports />
    </>
  );
}


