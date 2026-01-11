"use client";
import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import CheckoutModal from "./CheckoutModal";

export default function Checkout({
  cartItems,
  subtotal,
  gst,
  total,
  setCartItems,
}) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Increment quantity
  const increment = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // Decrement quantity
  const decrement = (id) => {
    setCartItems(
      (prev) =>
        prev
          .map((item) =>
            item.id === id ? { ...item, qty: item.qty - 1 } : item
          )
          .filter((item) => item.qty > 0) // remove if qty 0
    );
  };

  return (
    <aside className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3"
          >
            {/* Product info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                {item.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ₹{item.unitPrice} each
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => decrement(item.id)}
                className="flex items-center justify-center w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
              >
                <FaMinus size={12} />
              </button>
              <span className="w-5 text-center font-medium">{item.qty}</span>
              <button
                onClick={() => increment(item.id)}
                className="flex items-center justify-center w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
              >
                <FaPlus size={12} />
              </button>
            </div>

            {/* Total for this item */}
            <p className="ml-4 font-semibold text-gray-800 dark:text-gray-100">
              ₹{(item.qty * item.unitPrice).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t p-4 space-y-3 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">GST (5%)</span>
          <span className="font-medium">₹{gst.toFixed(2)}</span>
        </div>
        <hr className="border-gray-300 dark:border-gray-600" />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        {/* Pay button */}
        <button
          onClick={() => total > 0 && setIsCheckoutOpen(true)}
          className="w-full mt-4 h-12 btn-primary transition shadow-md cursor-pointer"
        >
          Pay
        </button>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        subtotal={subtotal}
        gst={gst}
        total={total}
        onConfirm={(customerData) => {
          setIsCheckoutOpen(false);
          setCartItems([]);
          // clear cart, save sale, navigate to invoice, etc.
        }}
      />
    </aside>
  );
}
