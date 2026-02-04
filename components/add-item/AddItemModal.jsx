"use client";

import { useEffect, useState } from "react";
import AddCategory from "./AddCategory";
import AddItem from "./AddItem";
import { FiX, FiPackage, FiClipboard } from "react-icons/fi";

export default function AddItemModal({
  isOpen,
  onClose,
  onAddItem,
  onUpdateItem,
  editingItem,
  idToken,
  fixedCategory = null, // New Prop
}) {
  const [activeTab, setActiveTab] = useState("item");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!idToken) {
        setCategories([]);
        return;
      }
      try {
        const authFetch = (await import("@/lib/authFetch")).default;
        const res = await authFetch("/api/categories", {}, idToken);

        if (!res.ok) {
          setCategories([]);
          return;
        }

        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Fetch categories error:", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [idToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
        {/* Pink Decorative Header */}
        <div className="h-2 bg-brand-pink w-full" />
        
        {/* Header with Exit */}
        <div className="p-8 pb-0 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {editingItem ? "Edit Product" : fixedCategory === "rooms" ? "Add New Room" : "System Inventory"}
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              {activeTab === "item" ? (fixedCategory === "rooms" ? "Room Registry" : "Product Management") : "Category Management"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-brand-pink transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modern Tabs */}
        <div className="px-8 mt-8 flex gap-2">
          <button
            onClick={() => setActiveTab("item")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "item"
                ? "bg-brand-pink text-white"
                : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100"
            }`}
          >
            <FiPackage size={14} />
            {editingItem ? "Edit Item" : fixedCategory === "rooms" ? "Room Details" : "Add Item"}
          </button>
          {!fixedCategory && (
            <button
              onClick={() => setActiveTab("category")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "category"
                  ? "bg-brand-pink text-white"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100"
              }`}
            >
              <FiClipboard size={14} />
              Category
            </button>
          )}
        </div>

        {/* Content Area with custom scrollbar */}
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {activeTab === "item" ? (
            <AddItem
              onAddItem={onAddItem}
              onUpdateItem={onUpdateItem}
              editingItem={editingItem}
              categories={categories}
              fixedCategory={fixedCategory}
            />
          ) : (
            <AddCategory
              categories={categories}
              setCategories={setCategories}
              idToken={idToken}
              onUpdateItem={onUpdateItem}
            />
          )}
        </div>
      </div>
    </div>
  );
}
