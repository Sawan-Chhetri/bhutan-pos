"use client";

import { useState } from "react";
import AddCategory from "./AddCategory";
import AddItem from "./AddItem";

export default function AddItemModal({
  isOpen,
  onClose,
  onAddItem,
  onUpdateItem,
  editingItem,
}) {
  const [activeTab, setActiveTab] = useState("item");
  const [categories, setCategories] = useState([]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-20 px-2">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-lg shadow-lg">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 ${
              activeTab === "item" ? "border-b-2 border-amber-400" : ""
            }`}
            onClick={() => setActiveTab("item")}
          >
            {editingItem ? "Edit Item" : "Add Item"}
          </button>
          <button
            className={`flex-1 py-3 ${
              activeTab === "category" ? "border-b-2 border-amber-400" : ""
            }`}
            onClick={() => setActiveTab("category")}
          >
            Add Category
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "item" ? (
            <AddItem
              onAddItem={onAddItem}
              onUpdateItem={onUpdateItem}
              editingItem={editingItem}
              categories={categories}
            />
          ) : (
            <AddCategory
              categories={categories}
              setCategories={setCategories}
            />
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
