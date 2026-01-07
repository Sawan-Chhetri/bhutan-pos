"use client";

import { useState } from "react";
import AddCategory from "./AddCategory";
import AddItem from "./AddItem";

export default function AddItemModal({
  isOpen,
  onClose,
  onAddItem,
  onAddCategory,
}) {
  const [activeTab, setActiveTab] = useState("item"); // "item" or "category"
  const [categories, setCategories] = useState([]); // local categories list

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-20 px-2">
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b dark:border-gray-700">
            <button
              className={`flex-1 py-3 font-medium text-center transition ${
                activeTab === "item"
                  ? "border-b-2 border-amber-400 text-amber-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("item")}
            >
              Add Item
            </button>
            <button
              className={`flex-1 py-3 font-medium text-center transition ${
                activeTab === "category"
                  ? "border-b-2 border-amber-400 text-amber-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("category")}
            >
              Add Category
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "item" ? (
              <AddItem
                onAddItem={onAddItem}
                categories={categories} // categories passed from AddCategory
              />
            ) : (
              <AddCategory
                onAddCategory={onAddCategory}
                categories={categories}
                setCategories={setCategories}
              />
            )}
          </div>

          {/* Close Button */}
          <div className="px-6 pb-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );
}
