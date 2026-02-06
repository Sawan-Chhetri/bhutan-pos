"use client";

import { useState, useEffect } from "react";

export default function KgModal({ isOpen, onClose, product, onConfirm }) {
  const [weight, setWeight] = useState("");

  if (!isOpen || !product) return null;

  const unitLabel = product.unitType || "kg";

  const handleConfirm = () => {
    const qty = parseFloat(weight);
    if (!qty || qty <= 0) return;
    onConfirm(qty);
    setWeight("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 ring-1 ring-gray-200 dark:ring-gray-700 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Enter Weight
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {product.name.toUpperCase()}
            </span>{" "}
            is sold by {unitLabel}.
          </p>
        </div>

        {/* Input */}
        <div className="mb-6 relative">
          <input
            type="number"
            step="0.25"
            className="w-full px-4 py-4 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-2xl text-center font-bold focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
              if (e.key === "Escape") onClose();
            }}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold uppercase">
            {unitLabel}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!weight || parseFloat(weight) <= 0}
            className="px-4 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/30 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
