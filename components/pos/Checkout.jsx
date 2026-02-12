"use client";
import { useState } from "react";
import {
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiCreditCard,
  FiTrash2,
} from "react-icons/fi";
import CheckoutModal from "./CheckoutModal";
import PrintReceiptModal from "./PrintReceiptModal";

export default function Checkout({
  cartItems,
  subtotal,
  gst,
  total,
  setCartItems,
  showPrintModal,
  setShowPrintModal,
  saleId,
  setSaleId,
  globalDiscount,
  setGlobalDiscount,
  onSimulateScan, // <--- New Prop
}) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showCustomDiscount, setShowCustomDiscount] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState("");

  const increment = (cartId, unitType) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const idMatch = item.cartId
          ? item.cartId === cartId
          : item.id === cartId;
        if (idMatch) {
          // If weighted item (kg/l), increment by 0.1
          const incrementAmount = unitType && unitType !== "default" ? 0.1 : 1;
          // Use parseFloat to fix floating point math issues (e.g. 0.1 + 0.2 = 0.300000004)
          const newQty = parseFloat((item.qty + incrementAmount).toFixed(3));
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  const decrement = (cartId, unitType) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          const idMatch = item.cartId
            ? item.cartId === cartId
            : item.id === cartId;
          if (idMatch) {
            const decrementAmount =
              unitType && unitType !== "default" ? 0.1 : 1;
            const newQty = parseFloat((item.qty - decrementAmount).toFixed(3));
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0),
    );
  };

  const handleManualQtyChange = (cartId, newQty) => {
    const qty = parseFloat(newQty);
    if (!isNaN(qty) && qty >= 0) {
      setCartItems((prev) =>
        prev.map((item) => {
          const idMatch = item.cartId
            ? item.cartId === cartId
            : item.id === cartId;
          return idMatch ? { ...item, qty: parseFloat(qty.toFixed(3)) } : item;
        }),
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setGlobalDiscount({ value: 0, type: "percent", reason: "" });
  };

  const handleApplyGlobalDiscount = (value, type = "percent") => {
    setGlobalDiscount((prev) => ({ ...prev, value, type }));
    setShowCustomDiscount(false);
  };

  const handleApplyReason = (reason) => {
    setGlobalDiscount((prev) => ({ ...prev, reason }));
  };

  const handleCustomDiscountSubmit = (e) => {
    if (e.key === "Enter") {
      const val = parseFloat(customDiscountValue) || 0;
      handleApplyGlobalDiscount(val, "fixed");
    }
  };

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FiShoppingCart className="text-brand-pink" size={20} />
          <h2 className="font-black text-gray-900 dark:text-white tracking-tight uppercase">
            Current Order
          </h2>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Clear All"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-2">
            <FiShoppingCart size={48} strokeWidth={1} />
            <p className="font-bold uppercase text-xs tracking-widest">
              Cart is empty
            </p>
          </div>
        ) : (
          cartItems.map((item, index) => {
            const hasItemDiscount = (item.discountPercent || 0) > 0;
            const effectivePrice =
              item.unitPrice * (1 - (item.discountPercent || 0) / 100);
            const lineTotal = item.qty * effectivePrice;

            return (
              <div
                key={item.cartId || `${item.id}-${index}`}
                className="group bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-transparent hover:border-brand-pink/20 transition-all"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 dark:text-gray-100 uppercase text-xs leading-tight line-clamp-2">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {hasItemDiscount && (
                        <span className="text-[10px] font-mono text-gray-400 line-through">
                          Nu.{" "}
                          {item.unitPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                      <p className="text-[10px] font-mono text-brand-pink font-bold uppercase">
                        Nu.{" "}
                        {effectivePrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        /{" "}
                        {item.category === "rooms"
                          ? "night"
                          : item.unitType === "default"
                            ? "unit"
                            : item.unitType}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900 dark:text-white text-sm">
                    Nu.{" "}
                    {lineTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() =>
                        decrement(item.cartId || item.id, item.unitType)
                      }
                      className="p-1 text-gray-500 hover:text-brand-pink hover:bg-brand-pink/5 rounded transition-colors"
                    >
                      <FiMinus size={14} />
                    </button>
                    {item.unitType !== "default" ? (
                      <input
                        type="number"
                        className="w-12 text-center text-xs font-black text-gray-900 dark:text-white bg-transparent outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        value={item.qty}
                        onChange={(e) =>
                          handleManualQtyChange(
                            item.cartId || item.id,
                            e.target.value,
                          )
                        }
                        step="0.001"
                      />
                    ) : (
                      <span className="w-8 text-center text-xs font-black text-gray-900 dark:text-white">
                        {item.qty}
                      </span>
                    )}
                    <button
                      onClick={() =>
                        increment(item.cartId || item.id, item.unitType)
                      }
                      className="p-1 text-gray-500 hover:text-brand-pink hover:bg-brand-pink/5 rounded transition-colors"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  {hasItemDiscount && (
                    <span className="text-[9px] font-black bg-brand-pink/10 text-brand-pink px-2 py-0.5 rounded uppercase">
                      -{item.discountPercent}% Off
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary & Checkout */}
      <div className="bg-gray-50 dark:bg-gray-900/80 p-6 space-y-4 border-t border-gray-200 dark:border-gray-800">
        {/* Global Discount Section */}
        {cartItems.length > 0 && (
          <div className="space-y-3 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Global Discount
              </span>
              {globalDiscount.value > 0 && (
                <button
                  onClick={() =>
                    setGlobalDiscount({ value: 0, type: "percent", reason: "" })
                  }
                  className="text-[10px] font-black text-brand-pink py-1 px-2 hover:bg-brand-pink/5 rounded transition-colors"
                >
                  RESET
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {[5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleApplyGlobalDiscount(pct, "percent")}
                  className={`flex-1 py-2 text-[10px] font-black rounded-xl border transition-all ${
                    globalDiscount.type === "percent" &&
                    globalDiscount.value === pct
                      ? "bg-brand-pink border-brand-pink text-white shadow-lg shadow-brand-pink/20 scale-105"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-brand-pink/50"
                  }`}
                >
                  {pct}%
                </button>
              ))}
              <button
                onClick={() => setShowCustomDiscount(!showCustomDiscount)}
                className={`flex-1 py-2 text-[10px] font-black rounded-xl border transition-all ${
                  globalDiscount.type === "fixed" || showCustomDiscount
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-brand-pink/50"
                }`}
              >
                {globalDiscount.type === "fixed" && globalDiscount.value > 0
                  ? `Nu. ${globalDiscount.value}`
                  : "CUSTOM"}
              </button>
            </div>

            {showCustomDiscount && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <input
                  autoFocus
                  type="number"
                  placeholder="Enter fixed amount (Nu.)"
                  value={customDiscountValue}
                  onChange={(e) => setCustomDiscountValue(e.target.value)}
                  onKeyDown={handleCustomDiscountSubmit}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-brand-pink/30 rounded-xl outline-none focus:border-brand-pink text-xs font-bold transition-all shadow-xl shadow-brand-pink/10"
                />
                <p className="text-[9px] text-gray-400 mt-1.5 ml-1 italic">
                  Press Enter to apply fixed discount
                </p>
              </div>
            )}

            {/* Discount Reason (Only when discount applied) */}
            {globalDiscount.value > 0 && (
              <div className="animate-in slide-in-from-top-2 duration-300 mt-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">
                  Reason for Discount
                </label>
                <select
                  value={globalDiscount.reason}
                  onChange={(e) => handleApplyReason(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-brand-pink text-xs font-bold transition-all appearance-none"
                  required
                >
                  <option value="">Select Reason...</option>
                  <option value="Staff Discount">Staff Discount</option>
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Loyalty">Loyalty</option>
                  <option value="Promotion/Sales">Promotion/Sales</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-500 uppercase tracking-widest">
              Net Subtotal
            </span>
            <span className="font-mono text-gray-900 dark:text-gray-100">
              Nu.{" "}
              {subtotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {globalDiscount.value > 0 && (
            <div className="flex justify-between items-center text-xs text-brand-pink">
              <span className="font-bold uppercase tracking-widest">
                Discount (
                {globalDiscount.type === "percent"
                  ? `${globalDiscount.value}%`
                  : "Fixed"}
                )
              </span>
              <span className="font-mono font-black">
                - Nu.{" "}
                {(globalDiscount.type === "percent"
                  ? (subtotal * globalDiscount.value) / 100
                  : globalDiscount.value
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-500 uppercase tracking-widest">
              Tax (GST 5%)
            </span>
            <span className="font-mono text-gray-900 dark:text-gray-100">
              Nu.{" "}
              {gst.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Total & Pay */}
        <div className="flex justify-between items-end pb-2">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Total Payable
            </span>
            <div className="text-3xl font-black text-gray-900 dark:text-white leading-none mt-1">
              <span className="text-lg align-top opacity-50 mr-1">Nu.</span>
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        <button
          onClick={() => total > 0 && setIsCheckoutOpen(true)}
          disabled={total <= 0}
          className="w-full relative group overflow-hidden bg-gray-900 dark:bg-brand-pink text-white h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-gray-900/10 dark:shadow-brand-pink/20 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <FiCreditCard size={18} />
            PROCEED TO PAY
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
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
        showPrintModal={showPrintModal}
        setShowPrintModal={setShowPrintModal}
        saleId={saleId}
        setSaleId={setSaleId}
        globalDiscount={globalDiscount}
        onConfirm={(customerData) => {
          setIsCheckoutOpen(false);
          setCartItems([]);
          setGlobalDiscount({ value: 0, type: "percent", reason: "" });
        }}
      />
      {showPrintModal && (
        <PrintReceiptModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          saleId={saleId}
        />
      )}
    </aside>
  );
}
