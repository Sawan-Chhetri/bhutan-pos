"use client";
import ShoppingListScreen from "@/components/shopping-list/ShoppingListScreen";
import Sidebar from "@/components/nav/Sidebar";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function ShoppingListPage() {
  const { isAuthorized, isLoading } = useAuthGuard(["pos"]);

  if (isLoading) return <div className="p-10">Authenticating...</div>;
  if (!isAuthorized) return null;

  return (
    <>
      <Sidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <ShoppingListScreen />
      </div>
    </>
  );
}
