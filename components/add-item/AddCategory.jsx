"use client";

import { useState } from "react";
import { FiTrash2, FiPlus, FiTag } from "react-icons/fi";

export default function AddCategory({
  setCategories,
  categories,
  idToken,
  onUpdateItem,
}) {
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
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
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (categoryId) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    try {
      const authFetch = (await import("@/lib/authFetch")).default;
      await authFetch(
        `/api/categories/${categoryId}`,
        { method: "DELETE" },
        idToken
      );
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-pink outline-none dark:bg-gray-800 transition-all text-sm font-medium";
  const labelClasses = "text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2";

  return (
    <div className="space-y-8">
      {/* Add Category Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClasses}>
            <FiTag /> New Category Name
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className={inputClasses}
              placeholder="e.g. Beverages"
              required
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand-pink text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:bg-gray-400"
            >
              <FiPlus size={20} />
            </button>
          </div>
        </div>
      </form>

      {/* Added Categories List */}
      <div>
        <h3 className="text-[10px] font-black text-brand-pink uppercase tracking-[0.2em] mb-4">
          Existing Categories ({categories.length})
        </h3>
        
        {categories.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              No Categories Created
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group flex justify-between items-center px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-brand-pink transition-all shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-pink" />
                  <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight truncate max-w-[120px]">
                    {cat.name}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(cat.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
