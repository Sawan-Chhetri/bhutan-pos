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
  FiArrowRight,
} from "react-icons/fi";

export default function AddItem({
  onAddItem,
  onUpdateItem,
  categories = [],
  editingItem = null,
  fixedCategory = null, // New Prop
}) {
  // Initialize state directly from the prop
  const [name, setName] = useState(editingItem?.name || "");
  const [barcode, setBarcode] = useState(editingItem?.barcode || "");
  const [category, setCategory] = useState(
    fixedCategory || editingItem?.category || "",
  );
  const [price, setPrice] = useState(editingItem?.price || "");
  const [initialStock, setInitialStock] = useState(0);
  const [minStock, setMinStock] = useState(editingItem?.minStock || 5);
  const [unitType, setUnitType] = useState(editingItem?.unitType || "default"); // New state for unit type
  const [discountPercent, setDiscountPercent] = useState(
    editingItem?.discountPercent || 0,
  );
  const [isGSTExempt, setIsGSTExempt] = useState(!!editingItem?.isGSTExempt);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemId = editingItem ? editingItem.id : null;
  const { idToken } = useAuthStatus();
  const { user, loading: userLoading } = useContext(UserContext);
  const permissions = usePermissions(user);

  // Detect if editing a room item
  const isEditingRoom = editingItem?.category === "rooms";

  const discountedPrice =
    discountPercent > 0
      ? Number(price) * (1 - Number(discountPercent) / 100)
      : Number(price);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !price) return;

    setIsSubmitting(true);
    const payload = {
      id: itemId,
      name: name.trim().toLowerCase(),
      category: category.trim().toLowerCase(),
      price: Number(price),
      discountPercent: Number(discountPercent),
      isGSTExempt,
      barcode: barcode.trim() || null,
      unitType, // Add unitType to payload
      // Fix: Preserve existing stock when editing, use initialStock only for new items
      stock: editingItem
        ? editingItem.stock
        : permissions.canTrackStock
          ? Number(initialStock)
          : 0,
      minStock: permissions.canTrackStock ? Number(minStock) : 0,
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
                price: Number(price),
                discountPercent: Number(discountPercent),
                category: payload.category,
                isGSTExempt,
                barcode: barcode.trim() || null,
                unitType, // Add unitType to updates
                minStock: permissions.canTrackStock
                  ? Number(minStock)
                  : undefined,
              },
            }),
          },
          idToken,
        );
      } else {
        const res = await authFetch(
          "/api/modify-items",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              item: {
                name: payload.name,
                price: Number(price),
                discountPercent: Number(discountPercent),
                category: payload.category,
                isGSTExempt,
                barcode: barcode.trim() || null,
                unitType, // Add unitType to new item
                stock: permissions.canTrackStock ? Number(initialStock) : 0,
                minStock: permissions.canTrackStock ? Number(minStock) : 0,
              },
            }),
          },
          idToken,
        );

        if (res.ok) {
          const { id } = await res.json();
          onAddItem({ ...payload, id });
        }
      }

      if (!editingItem) {
        setName("");
        setCategory("");
        setPrice("");
        setDiscountPercent(0);
        setInitialStock(0);
        setMinStock(5);
        setUnitType("default");
        setIsGSTExempt(false);
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-pink outline-none dark:bg-gray-800 transition-all text-sm font-medium";
  const labelClasses =
    "text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Item Name */}
      <div>
        <label className={labelClasses}>
          <FiPackage />{" "}
          {fixedCategory === "rooms"
            ? "Room Number / Name"
            : "Item Description"}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
          placeholder={
            fixedCategory === "rooms" ? "e.g. Deluxe Room" : "e.g. Item name"
          }
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Dropdown (Hidden if fixed OR editing a room) */}
        {!fixedCategory && !isEditingRoom && (
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
              {categories
                .filter((cat) => cat.name !== "rooms") // Hide rooms from dropdown
                .map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name.toUpperCase()}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Unit Type Selection */}
        {!fixedCategory && !isEditingRoom && (
          <div>
            <label className={labelClasses}>
              <FiPackage /> Unit Type
            </label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value)}
              className={inputClasses}
            >
              <option value="default">Per Item</option>
              <option value="kg">Per Kilogram (kg)</option>
              <option value="l">Per Liter (l)</option>
            </select>
          </div>
        )}

        {/* Price & Discount */}
        <div className="col-span-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                <FiDollarSign /> Base Selling Price (Nu.)
              </label>
              <input
                type="number"
                step="0.01"
                onWheel={(e) => e.target.blur()}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClasses}
                placeholder="0.00"
                required
              />
            </div>

            {/* Discount Percent (Editable only in Edit Mode) */}
            <div>
              <label
                className={`${labelClasses} ${!editingItem ? "opacity-50" : ""}`}
              >
                <FiTag /> Item Discount (%)
              </label>
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                disabled={!editingItem}
                className={`${inputClasses} ${!editingItem ? "bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed" : ""}`}
                placeholder="0"
              />
            </div>
          </div>

          {/* Real-time Preview */}
          {editingItem && (
            <div className="mt-4 p-3 bg-brand-pink/5 border border-brand-pink/10 rounded-xl flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-brand-pink tracking-widest">
                Discount Preview
              </span>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Nu. {Number(price).toLocaleString()}{" "}
                <FiArrowRight className="inline mx-1" />
                <span className="text-brand-pink font-black">
                  Nu. {discountedPrice.toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Barcode */}
      {fixedCategory !== "rooms" && (
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
      )}

      {permissions.canTrackStock && fixedCategory !== "rooms" && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-brand-pink uppercase tracking-[0.2em]">
              Stock Inventory
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {!editingItem && (
              <div>
                <label className={labelClasses}>
                  Initial Count {unitType !== "default" && `(${unitType})`}
                </label>
                <input
                  type="number"
                  step={unitType === "default" ? "1" : "0.25"}
                  onWheel={(e) => e.target.blur()}
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  className={inputClasses}
                  placeholder={unitType === "default" ? "0" : "0.000"}
                />
              </div>
            )}
            <div className={editingItem ? "col-span-2" : ""}>
              <label className={labelClasses}>
                <FiBarChart2 /> Min Alert Level{" "}
                {unitType !== "default" && `(${unitType})`}
              </label>
              <input
                type="number"
                step={unitType === "default" ? "1" : "0.25"}
                onWheel={(e) => e.target.blur()}
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className={inputClasses}
                placeholder={unitType === "default" ? "5" : "0.500"}
              />
            </div>
          </div>
        </div>
      )}

      {/* GST Exempt Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${isGSTExempt ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
          >
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
        {isSubmitting ? (
          "Processing..."
        ) : (
          <>
            {editingItem ? "Update System Item" : "Confirm & Add to System"}
            <FiArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
