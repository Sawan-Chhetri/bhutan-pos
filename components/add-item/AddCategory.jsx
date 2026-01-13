"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function AddCategory({ setCategories, categories, idToken }) {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const authFetch = (await import("@/lib/authFetch")).default;
    const res = await authFetch(
      "/api/categories",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: categoryName.trim().toLowerCase() }),
      },
      idToken
    );

    const newCategory = await res.json();

    setCategories((prev) => [
      ...prev,
      {
        id: newCategory.id,
        name: categoryName.trim().toLocaleString(),
      },
    ]);
    setCategoryName("");
  };

  // Remove category
  const handleRemove = async (categoryId) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    try {
      const authFetch = (await import("@/lib/authFetch")).default;
      await authFetch(`/api/categories/${categoryId}`, { method: "DELETE" }, idToken);

      // Optimistically update UI
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Category Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter category name"
          />
        </div>

        <button type="submit" className="btn-primary px-4 py-2 font-semibold">
          Add Category
        </button>
      </form>

      {/* Added Categories List */}
      {categories.length > 0 && (
        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto ">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex justify-between items-center border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <span className="text-gray-800 dark:text-gray-100">
                {cat.name}
              </span>
              <button
                onClick={() => handleRemove(cat.id)}
                className="text-red-500 hover:text-red-700 transition"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
