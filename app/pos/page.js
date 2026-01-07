import Sidebar from "@/components/nav/Sidebar";
import PosLayout from "@/components/pos/PosLayout";

function page() {
  return (
    <div className="h-screen">
      <Sidebar />
      <PosLayout />;
    </div>
  );
}

export default page;
