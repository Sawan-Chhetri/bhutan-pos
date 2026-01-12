import InvoiceBuilder from "@/components/invoice/InvoiceBuilder";
import Sidebar from "@/components/nav/Sidebar";

export const metadata = {
  title: "New Invoice",
};

export default function Page() {
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="max-w-4xl mx-auto">
        <InvoiceBuilder />
      </div>
    </div>
  );
}
