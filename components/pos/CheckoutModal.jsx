"use client";

import { useState } from "react";

import useAuthStatus from "@/hooks/useAuthStatus";

export default function CheckoutModal({
  isOpen,
  onClose,
  subtotal,
  gst,
  total,
  onConfirm,
  cartItems,
  setCartItems,
  showPrintModal,
  setShowPrintModal,
  saleId,
  setSaleId,
}) {
  const { idToken } = useAuthStatus();
  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState("");

  if (!isOpen) return null;

  const handleConfirm = async ({ customerName, contact }) => {
    // Handle payment confirmation logic here
    try {
      const authFetch = (await import("@/lib/authFetch")).default;
      const res = await authFetch(
        "/api/sales",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems,
            subtotal,
            gst,
            total,
            customerName,
            contact,
          }),
        },
        idToken
      );
      const data = await res.json();
      if (data.saleId) {
        setSaleId(data.saleId);
        setShowPrintModal(true);
        setCartItems([]); // ✅ Clear cart after successful sale
        onConfirm?.();
      }
    } catch (err) {
      console.error("Sale failed", err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-lg">
          {/* Header */}
          <div className="px-6 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Checkout
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Customer details (optional)
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Email or Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email or Phone
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Order Summary */}
            <div className="border rounded-lg p-3 space-y-2 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>Nu. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST</span>
                <span>Nu. {gst.toFixed(2)}</span>
              </div>
              <hr className="dark:border-gray-600" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>Nu. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm({ customerName, contact })}
              className="px-4 py-2 rounded-md btn-primary transition"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
