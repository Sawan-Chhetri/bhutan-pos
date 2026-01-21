"use client";
import InvoiceBuilder from "@/components/invoice/InvoiceBuilder";
import Sidebar from "@/components/nav/Sidebar";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function Page() {
  const { isAuthorized, isLaoding } = useAuthGuard(["other"]);
  if (!isAuthorized) {
    return null;
  }
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="max-w-4xl mx-auto">
        <InvoiceBuilder />
      </div>
    </div>
  );
}
