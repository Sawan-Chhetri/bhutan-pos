"use client";

import { useState } from "react";

import useAuthStatus from "@/hooks/useAuthStatus";

// export default function CheckoutModal({
//   isOpen,
//   onClose,
//   subtotal,
//   gst,
//   total,
//   onConfirm,
//   cartItems,
//   setCartItems,
//   showPrintModal,
//   setShowPrintModal,
//   saleId,
//   setSaleId,
// }) {
//   const { idToken } = useAuthStatus();
//   const [customerName, setCustomerName] = useState("");
//   const [contact, setContact] = useState("");
//   const [customerCID, setCustomerCID] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");

//   if (!isOpen) return null;

//   const handleConfirm = async ({ customerName, contact }) => {
//     // Handle payment confirmation logic here

//     if (total > 50000) {
//       if (!customerName.trim() || !customerCID.trim()) {
//         setErrorMsg(
//           "For transactions above Nu. 50,000, Customer Name and CID/Passport Number are required.",
//         );
//         return;
//       }
//     }

//     try {
//       const authFetch = (await import("@/lib/authFetch")).default;
//       const res = await authFetch(
//         "/api/sales",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             cartItems,
//             subtotal,
//             gst,
//             total,
//             customerName: customerName.trim() || "Walk-in Customer",
//             customerCID: customerCID.trim() || null,
//             contact: contact.trim() || null,
//           }),
//         },
//         idToken,
//       );
//       const data = await res.json();
//       if (data.saleId) {
//         setSaleId(data.saleId);
//         setShowPrintModal(true);
//         setCartItems([]); // ✅ Clear cart after successful sale
//         onConfirm?.();
//       }
//     } catch (err) {
//       console.error("Sale failed", err);
//     }
//   };

//   return (
//     <>
//       <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
//         <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-lg">
//           {/* Header */}
//           <div className="px-6 pt-6">
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Checkout
//             </h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//               {total > 50000
//                 ? "Customer details (required)"
//                 : "Customer details (optional)"}
//             </p>
//           </div>

//           {errorMsg && (
//             <div className="mb-4 text-center text-red-500 font-medium bg-red-50 border border-red-200 rounded p-2">
//               {errorMsg}
//             </div>
//           )}

//           {/* Body */}
//           <div className="px-6 py-4 space-y-4">
//             {/* Customer Name */}
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Customer Name
//               </label>
//               <input
//                 type="text"
//                 value={customerName}
//                 onChange={(e) => setCustomerName(e.target.value)}
//                 placeholder={total > 50000 ? "Required" : "Optional"}
//                 className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>

//             {/* Customer CID */}
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 CID or Passport Number
//               </label>
//               <input
//                 type="text"
//                 value={customerCID}
//                 onChange={(e) => setCustomerCID(e.target.value)}
//                 placeholder={total > 50000 ? "Required" : "Optional"}
//                 className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>

//             {/* Email or Phone */}
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Email or Phone
//               </label>
//               <input
//                 type="text"
//                 value={contact}
//                 onChange={(e) => setContact(e.target.value)}
//                 placeholder="Optional"
//                 className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//               />
//             </div>

//             {/* Order Summary */}
//             <div className="border rounded-lg p-3 space-y-2 dark:border-gray-700">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-500">Subtotal</span>
//                 <span>Nu. {subtotal.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-500">GST</span>
//                 <span>Nu. {gst.toFixed(2)}</span>
//               </div>
//               <hr className="dark:border-gray-600" />
//               <div className="flex justify-between font-semibold">
//                 <span>Total</span>
//                 <span>Nu. {total.toFixed(2)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="px-6 pb-6 flex justify-end gap-3">
//             <button
//               onClick={() => {
//                 setErrorMsg("");
//                 onClose();
//               }}
//               className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={() => handleConfirm({ customerName, contact })}
//               className="px-4 py-2 rounded-md btn-primary transition"
//             >
//               Confirm Payment
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

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
  globalDiscount,
}) {
  const { idToken } = useAuthStatus();
  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState("");
  const [customerCID, setCustomerCID] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // High Value Flag
  const isHighValue = total > 50000;

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isHighValue) {
      if (!customerName.trim() || !customerCID.trim()) {
        setErrorMsg(
          "Please provide required customer details for high-value sales.",
        );
        return;
      }
    }

    if (globalDiscount?.value > 0 && !globalDiscount?.reason) {
      setErrorMsg("Please select a reason for the global discount.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");
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
            globalDiscount, // Pass the discount object
            customerName: customerName.trim() || "Walk-in Customer",
            customerCID: customerCID.trim() || null,
            contact: contact.trim() || null,
          }),
        },
        idToken,
      );

      const data = await res.json();
      if (data.saleId) {
        setSaleId(data.saleId);
        setShowPrintModal(true);
        setCartItems([]);
        onConfirm?.();
        onClose();
      } else {
        setErrorMsg(data.error || "Transaction failed");
      }
    } catch (err) {
      console.error("Sale failed", err);
      setErrorMsg("Connection error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
        {/* Progress/Indicator Header */}
        {isHighValue && (
          <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 text-center flex-shrink-0">
            Verification Required (Sale {">"} 50k)
          </div>
        )}

        {/* Fixed Header */}
        <div className="p-6 md:p-8 pb-4 flex-shrink-0">
          <header>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Checkout
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Review sale and customer details
            </p>
          </header>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 custom-scrollbar">
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-tight">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              {errorMsg}
            </div>
          )}

          <div className="space-y-5">
            {/* Customer Name */}
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Customer Name{" "}
                  {isHighValue && <span className="text-red-500">*</span>}
                </label>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${isHighValue ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {isHighValue ? "Required" : "Optional"}
                </span>
              </div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl transition-all outline-none dark:bg-gray-800 ${
                  isHighValue && !customerName
                    ? "border-amber-300 ring-2 ring-amber-50"
                    : "border-gray-200 dark:border-gray-700 focus:border-brand-pink"
                }`}
              />
            </div>

            {/* CID Number */}
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  CID / Passport Number{" "}
                  {isHighValue && <span className="text-red-500">*</span>}
                </label>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${isHighValue ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {isHighValue ? "Required" : "Optional"}
                </span>
              </div>
              <input
                type="text"
                value={customerCID}
                onChange={(e) => setCustomerCID(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl transition-all outline-none dark:bg-gray-800 ${
                  isHighValue && !customerCID
                    ? "border-amber-300 ring-2 ring-amber-50"
                    : "border-gray-200 dark:border-gray-700 focus:border-brand-pink"
                }`}
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                Contact (Email/Phone)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-pink outline-none dark:bg-gray-800"
              />
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 mb-6">
              <h3 className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const hasItemDiscount = (item.discountPercent || 0) > 0;
                  const effectiveUnitPrice = item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                  const lineTotal = item.qty * effectiveUnitPrice;
                  
                  return (
                    <div key={item.id} className="flex justify-between text-sm group">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 dark:text-gray-100 uppercase text-[11px]">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {item.qty} × Nu. {item.unitPrice.toLocaleString()}
                          {hasItemDiscount && (
                            <span className="ml-2 text-brand-pink font-bold">
                              (-{item.discountPercent}%)
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                        Nu. {lineTotal.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Stacked Discount Breakdown */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Net Subtotal</span>
                  <span className="font-mono font-bold">Nu. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {globalDiscount && globalDiscount.value > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-brand-pink">
                      <span className="font-black uppercase tracking-wider">
                        Global Discount ({globalDiscount.type === "percent" ? `${globalDiscount.value}%` : "Fixed"})
                      </span>
                      <span className="font-mono font-black">
                        - Nu. {(globalDiscount.type === "percent" ? (subtotal * globalDiscount.value / 100) : globalDiscount.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {globalDiscount.reason && (
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight italic">
                        Reason: {globalDiscount.reason}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Tax (GST 5%)</span>
                  <span className="font-mono font-bold">Nu. {gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <span className="text-sm font-black text-brand-pink uppercase tracking-[0.2em]">Grand Total</span>
                  <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                    Nu. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Actions Button Area */}
        <div className="p-6 md:p-8 pt-4 flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={isSubmitting}
              onClick={() => {
                setErrorMsg("");
                onClose();
              }}
              className="px-4 py-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleConfirm}
              className={`px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-brand-pink hover:scale-[1.02] active:scale-95"
              }`}
            >
              {isSubmitting ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
      </div>
    
  );
}
