// "use client";
// import { useState } from "react";
// import { FaPlus, FaMinus } from "react-icons/fa";
// import CheckoutModal from "./CheckoutModal";
// import PrintReceiptModal from "./PrintReceiptModal";

// export default function Checkout({
//   cartItems,
//   subtotal,
//   gst,
//   total,
//   setCartItems,
// }) {
//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const [showPrintModal, setShowPrintModal] = useState(false);
//   const [saleId, setSaleId] = useState(null);

//   // Increment quantity
//   const increment = (id) => {
//     setCartItems((prev) =>
//       prev.map((item) =>
//         item.id === id ? { ...item, qty: item.qty + 1 } : item
//       )
//     );
//   };

//   // Decrement quantity
//   const decrement = (id) => {
//     setCartItems(
//       (prev) =>
//         prev
//           .map((item) =>
//             item.id === id ? { ...item, qty: item.qty - 1 } : item
//           )
//           .filter((item) => item.qty > 0) // remove if qty 0
//     );
//   };

//   return (
//     <aside className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
//       {/* Cart Items */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {cartItems.map((item) => (
//           <div
//             key={item.id}
//             className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3"
//           >
//             {/* Product info */}
//             <div className="flex-1 min-w-0">
//               <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
//                 {item.name}
//               </p>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Nu. {item.unitPrice} each
//               </p>
//             </div>

//             {/* Quantity controls */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => decrement(item.id)}
//                 className="flex items-center justify-center w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
//               >
//                 <FaMinus size={12} />
//               </button>
//               <span className="w-5 text-center font-medium">{item.qty}</span>
//               <button
//                 onClick={() => increment(item.id)}
//                 className="flex items-center justify-center w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
//               >
//                 <FaPlus size={12} />
//               </button>
//             </div>

//             {/* Total for this item */}
//             <p className="ml-4 font-semibold text-gray-800 dark:text-gray-100">
//               Nu. {(item.qty * item.unitPrice).toFixed(2)}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Totals */}
//       <div className="border-t p-4 space-y-3 dark:border-gray-700">
//         <div className="flex justify-between text-sm">
//           <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
//           <span className="font-medium">Nu. {subtotal.toFixed(2)}</span>
//         </div>
//         <div className="flex justify-between text-sm">
//           <span className="text-gray-500 dark:text-gray-400">GST (5%)</span>
//           <span className="font-medium">Nu. {gst.toFixed(2)}</span>
//         </div>
//         <hr className="border-gray-300 dark:border-gray-600" />
//         <div className="flex justify-between text-lg font-semibold">
//           <span>Total</span>
//           <span>Nu. {total.toFixed(2)}</span>
//         </div>

//         {/* Pay button */}
//         <button
//           onClick={() => total > 0 && setIsCheckoutOpen(true)}
//           className="w-full mt-4 h-12 btn-primary transition shadow-md cursor-pointer"
//         >
//           Pay
//         </button>
//       </div>

//       <CheckoutModal
//         isOpen={isCheckoutOpen}
//         onClose={() => setIsCheckoutOpen(false)}
//         cartItems={cartItems}
//         setCartItems={setCartItems}
//         subtotal={subtotal}
//         gst={gst}
//         total={total}
//         showPrintModal={showPrintModal}
//         setShowPrintModal={setShowPrintModal}
//         saleId={saleId}
//         setSaleId={setSaleId}
//         onConfirm={(customerData) => {
//           setIsCheckoutOpen(false);
//           setCartItems([]);
//           // clear cart, save sale, navigate to invoice, etc.
//         }}
//       />
//       {showPrintModal && (
//         <PrintReceiptModal
//           isOpen={showPrintModal}
//           onClose={() => setShowPrintModal(false)}
//           saleId={saleId}
//         />
//       )}
//     </aside>
//   );
// }

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
}) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showCustomDiscount, setShowCustomDiscount] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState("");

  const increment = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decrement = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setGlobalDiscount({ value: 0, type: "percent", reason: "" });
  };

  const handleApplyGlobalDiscount = (value, type = "percent") => {
    setGlobalDiscount(prev => ({ ...prev, value, type }));
    setShowCustomDiscount(false);
  };

  const handleApplyReason = (reason) => {
    setGlobalDiscount(prev => ({ ...prev, reason }));
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
          cartItems.map((item) => {
            const hasItemDiscount = (item.discountPercent || 0) > 0;
            const effectivePrice = item.unitPrice * (1 - (item.discountPercent || 0) / 100);
            const lineTotal = item.qty * effectivePrice;

            return (
              <div
                key={item.id}
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
                          Nu. {item.unitPrice.toLocaleString()}
                        </span>
                      )}
                      <p className="text-[10px] font-mono text-brand-pink font-bold uppercase">
                        Nu. {effectivePrice.toLocaleString()} / unit
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900 dark:text-white text-sm">
                    Nu. {lineTotal.toLocaleString()}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => decrement(item.id)}
                      className="p-1 text-gray-500 hover:text-brand-pink hover:bg-brand-pink/5 rounded transition-colors"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-gray-900 dark:text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => increment(item.id)}
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
                  onClick={() => setGlobalDiscount({ value: 0, type: "percent", reason: "" })}
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
                    globalDiscount.type === "percent" && globalDiscount.value === pct
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
              {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          {globalDiscount.value > 0 && (
            <div className="flex justify-between items-center text-xs text-brand-pink">
              <span className="font-bold uppercase tracking-widest">
                Discount ({globalDiscount.type === "percent" ? `${globalDiscount.value}%` : "Fixed"})
              </span>
              <span className="font-mono font-black">
                - Nu. {(globalDiscount.type === "percent" ? (subtotal * globalDiscount.value / 100) : globalDiscount.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-500 uppercase tracking-widest">
              Tax (GST 5%)
            </span>
            <span className="font-mono text-gray-900 dark:text-gray-100">
              Nu. {gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-4 border-t border-gray-300 dark:border-gray-700 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-brand-pink uppercase tracking-[0.2em]">
                Total Amount
              </span>
              <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                Nu.{" "}
                {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled={total === 0}
          onClick={() => total > 0 && setIsCheckoutOpen(true)}
          className={`
            w-full flex items-center justify-center gap-3 h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
            ${
              total > 0
                ? "bg-brand-pink text-white hover:scale-[1.02] active:scale-95 cursor-pointer"
                : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          <FiCreditCard size={20} strokeWidth={2.5} />
          Complete Payment
        </button>
      </div>

      {/* Keep existing Modal components */}
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
        onConfirm={() => {
          setIsCheckoutOpen(false);
          setCartItems([]);
        }}
      />
    </aside>
  );
}
