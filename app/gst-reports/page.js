"use client";
import GSTReports from "@/components/gst/GSTReports";
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
      <GSTReports />
    </>
  );
}

export default Page;
