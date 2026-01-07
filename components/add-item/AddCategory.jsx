"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function AddCategory({
  onAddCategory,
  setCategories,
  categories,
}) {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const newCategory = {
      id: Date.now(),
      name: categoryName.trim(),
    };

    // Add to local list
    setCategories((prev) => [...prev, newCategory]);

    // Callback to parent to store in DB
    onAddCategory?.(newCategory);

    setCategoryName("");
  };

  // Remove category
  const handleRemove = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
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

        <button
          type="submit"
          className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Add Category
        </button>
      </form>

      {/* Added Categories List */}
      {categories.length > 0 && (
        <div className="mt-4 space-y-2">
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
