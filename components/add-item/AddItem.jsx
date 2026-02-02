"use client";

import { useState, useEffect, useContext } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import { UserContext } from "@/contexts/UserContext";
import usePermissions from "@/hooks/usePermissions";
import { 
  FiPackage, 
  FiTag, 
  FiDollarSign, 
  FiLayers, 
  FiBarChart2, 
  FiCheck,
  FiArrowRight
} from "react-icons/fi";

export default function AddItem({
  onAddItem,
  onUpdateItem,
  categories = [],
  editingItem = null,
}) {
  // Initialize state directly from the prop
  const [name, setName] = useState(editingItem?.name || "");
  const [barcode, setBarcode] = useState(editingItem?.barcode || "");
  const [category, setCategory] = useState(editingItem?.category || "");
  const [price, setPrice] = useState(editingItem?.price || "");
  const [initialStock, setInitialStock] = useState(0);
  const [minStock, setMinStock] = useState(editingItem?.minStock || 5);
  const [isGSTExempt, setIsGSTExempt] = useState(!!editingItem?.isGSTExempt);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const itemId = editingItem ? editingItem.id : null;
  const { idToken } = useAuthStatus();
  const { user, loading: userLoading } = useContext(UserContext);
  const permissions = usePermissions(user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !price) return;

    setIsSubmitting(true);
    const payload = {
      id: itemId,
      name: name.trim().toLowerCase(),
      category: category.trim().toLowerCase(),
      price: Number(price),
      isGSTExempt,
      barcode: barcode.trim() || null,
    };

    try {
      if (editingItem && onUpdateItem) {
        onUpdateItem(payload);
        await authFetch(
          "/api/modify-items",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itemId,
              updates: {
                name: payload.name,
                price,
                category: payload.category,
                isGSTExempt,
                barcode: barcode.trim() || null,
                minStock: permissions.canTrackStock ? Number(minStock) : undefined,
              },
            }),
          },
          idToken
        );
      } else {
        onAddItem(payload);
        await authFetch(
          "/api/modify-items",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              item: {
                name: payload.name,
                price,
                category: payload.category,
                isGSTExempt,
                barcode: barcode.trim() || null,
                stock: permissions.canTrackStock ? Number(initialStock) : 0,
                minStock: permissions.canTrackStock ? Number(minStock) : 0,
              },
            }),
          },
          idToken
        );
      }

      if (!editingItem) {
        setName("");
        setCategory("");
        setPrice("");
        setInitialStock(0);
        setMinStock(5);
        setIsGSTExempt(false);
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-pink outline-none dark:bg-gray-800 transition-all text-sm font-medium";
  const labelClasses = "text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Item Name */}
      <div>
        <label className={labelClasses}>
          <FiPackage /> Item Description
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
          placeholder="e.g. Organic Red Apple"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Dropdown */}
        <div>
          <label className={labelClasses}>
            <FiLayers /> Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClasses}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className={labelClasses}>
            <FiDollarSign /> Unit Price (Nu.)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClasses}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Barcode */}
      <div>
        <label className={labelClasses}>
          <FiTag /> Barcode / SKU (Optional)
        </label>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className={inputClasses}
          placeholder="Scan or type barcode"
        />
      </div>

      {permissions.canTrackStock && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-brand-pink uppercase tracking-[0.2em]">
              Stock Inventory
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {!editingItem && (
              <div>
                <label className={labelClasses}>Initial Count</label>
                <input
                  type="number"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  className={inputClasses}
                  placeholder="0"
                />
              </div>
            )}
            <div className={editingItem ? "col-span-2" : ""}>
              <label className={labelClasses}>
                <FiBarChart2 /> Min Alert Level
              </label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className={inputClasses}
                placeholder="5"
              />
            </div>
          </div>
        </div>
      )}

      {/* GST Exempt Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isGSTExempt ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
            <FiCheck size={16} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-gray-900 dark:text-white">
              GST Tax Exempt
            </p>
            <p className="text-[10px] text-gray-400 font-bold">
              Check if this item is 0% GST
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsGSTExempt(!isGSTExempt)}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
            isGSTExempt ? "bg-brand-pink" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`bg-white w-4 h-4 rounded-full shadow-lg transform transition-transform duration-300 ${
              isGSTExempt ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-brand-pink text-white flex items-center justify-center gap-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em]  hover:scale-[1.02] active:scale-95 transition-all disabled:bg-gray-400"
      >
        {isSubmitting ? "Processing..." : (
          <>
            {editingItem ? "Update System Item" : "Confirm & Add to System"}
            <FiArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
