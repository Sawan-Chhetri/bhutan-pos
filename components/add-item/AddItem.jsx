"use client";
import { useState, useEffect, useContext } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import { UserContext } from "@/contexts/UserContext";

export default function AddItem({
  onAddItem,
  onUpdateItem,
  categories = [],
  editingItem = null,
}) {
  // Initialize state directly from the prop
  const [name, setName] = useState(editingItem?.name || "");
  const [category, setCategory] = useState(editingItem?.category || "");
  const [price, setPrice] = useState(editingItem?.price || "");
  const [isGSTExempt, setIsGSTExempt] = useState(!!editingItem?.isGSTExempt);
  const itemId = editingItem ? editingItem.id : null;
  const { idToken } = useAuthStatus();
  const { user, loading: userLoading } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !price) return;

    const payload = {
      id: itemId,
      name: name.trim().toLowerCase(),
      category: category.trim().toLowerCase(),
      price: Number(price),
      isGSTExempt,
    };

    if (editingItem && onUpdateItem) {
      onUpdateItem(payload);
      // Upadte item on the DB here.
      await fetch("/api/modify-items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          itemId,
          updates: {
            name: payload.name,
            price,
            category: payload.category,
            isGSTExempt,
          },
        }),
      });
    } else {
      onAddItem(payload);
      // Add item to the DB here.
      await fetch("/api/modify-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          item: {
            name: payload.name,
            price,
            category: payload.category,
            isGSTExempt,
          },
        }),
      });
    }

    // Reset form ONLY after add (optional but sensible)
    if (!editingItem) {
      setName("");
      setCategory("");
      setPrice("");
      setIsGSTExempt(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Item Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Item Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          placeholder="Enter item name"
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          placeholder="Enter price"
        />
      </div>

      {/* GST Exempt Toggle */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">GST Exempt?</label>
        <button
          type="button"
          onClick={() => setIsGSTExempt(!isGSTExempt)}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
            isGSTExempt ? "bg-brand-pink" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
              isGSTExempt ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary px-4 py-2 font-semibold">
        {editingItem ? "Update Item" : "Add Item"}
      </button>
    </form>
  );
}
