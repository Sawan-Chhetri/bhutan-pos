"use client";
import { useState, useEffect } from "react";
import {
  FiX,
  FiRefreshCcw,
  FiAlertCircle,
  FiLock,
  FiMinusCircle,
} from "react-icons/fi";

/**
 * RefundModal Component
 * Handles Item-Level Credit Note generation with quantity validation
 */
export default function RefundModal({ invoice, open, onClose, onRefund }) {
  const [returnQtys, setReturnQtys] = useState({});
  const [reason, setReason] = useState("Customer Return");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setReturnQtys({});
      setReason("Customer Return");
    }
  }, [open]);

  if (!open || !invoice) return null;

  // 🔢 Calculation Logic (Mirroring your backend discount ratio)
  const originalNetSubtotal = invoice.subtotal || 1;
  const originalFinalBeforeTax = invoice.finalBeforeTax || 1;
  const discountRatio = originalFinalBeforeTax / originalNetSubtotal;
  const GST_RATE = 0.05;

  const handleQtyChange = (itemId, val, maxQtyAllowed) => {
    // Ensure value is within 0 and the remaining refundable quantity
    const qty = Math.max(0, Math.min(maxQtyAllowed, Number(val)));
    setReturnQtys((prev) => ({ ...prev, [itemId]: qty }));
  };

  // Calculate totals for the preview card
  const refundDetails = invoice.items.reduce(
    (acc, item) => {
      const qty = returnQtys[item.itemId] || 0;
      // We use effectiveUnitPrice which already considers the line-level discounts if any
      const lineTotal = qty * (item.effectiveUnitPrice || item.unitPrice);
      acc.subtotal += lineTotal;

      if (!item.isGSTExempt) {
        // Apply global discount ratio to the refunded taxable base
        const taxableLine = lineTotal * discountRatio;
        acc.taxable += taxableLine;
        acc.gst += taxableLine * GST_RATE;
      }
      return acc;
    },
    { subtotal: 0, taxable: 0, gst: 0 },
  );

  const grandTotalRefund =
    refundDetails.subtotal * discountRatio + refundDetails.gst;

  const handleSubmit = async () => {
    // 1. Identify which items are being returned
    const itemsToRefund = invoice.items
      .filter((item) => (returnQtys[item.itemId] || 0) > 0)
      .map((item) => {
        const qty = returnQtys[item.itemId];
        // Get the base line total before global discounts
        const baseLineTotal = qty * (item.effectiveUnitPrice || item.unitPrice);

        // APPLY THE RATIO HERE: This is the actual value being returned per item
        const discountedLineTotal = baseLineTotal * discountRatio;

        return {
          ...item,
          qty: qty,
          // We override lineTotal to be the ACTUAL discounted value
          lineTotal: discountedLineTotal,
          // We keep track of the original price for reference
          unitPrice: item.unitPrice,
          effectiveUnitPrice: item.effectiveUnitPrice,
        };
      });

    if (itemsToRefund.length === 0) return;

    setIsSubmitting(true);
    try {
      // 2. Send the prepared items to your API
      await onRefund({
        cartItems: itemsToRefund,
        reason,
        // Pass the calculated totals to ensure backend and frontend agree
        totals: {
          subtotal: refundDetails.subtotal * discountRatio, // This is the final taxable subtotal
          taxableAmount: refundDetails.taxable,
          gstAmount: refundDetails.gst,
          grandTotal: grandTotalRefund,
        },
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <FiMinusCircle className="text-brand-pink" /> Issue Credit Note
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Referencing Invoice{" "}
              <span className="text-gray-900 dark:text-white">
                #{invoice.invoiceNumber}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiX size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 max-h-[55vh] overflow-y-auto">
          {/* Item Selector Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800">
                <th className="pb-4 text-left">Product Detail</th>
                <th className="pb-4 text-center">Remaining</th>
                <th className="pb-4 text-right w-32">Return Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {invoice.items.map((item) => {
                const alreadyRefunded = item.refundedQty || 0;
                const maxRefundable = item.qty - alreadyRefunded;
                const isFullyRefunded = maxRefundable <= 0;

                return (
                  <tr
                    key={item.itemId}
                    className={isFullyRefunded ? "opacity-40" : ""}
                  >
                    <td className="py-5">
                      <p className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Sold: {item.qty}
                        </p>
                        {alreadyRefunded > 0 && (
                          <p className="text-[9px] font-black text-brand-pink uppercase">
                            Returned: {alreadyRefunded}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-5 text-center">
                      <span
                        className={`text-xs font-mono font-black ${isFullyRefunded ? "text-gray-300" : "text-gray-900 dark:text-white"}`}
                      >
                        {maxRefundable}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      {isFullyRefunded ? (
                        <div className="flex items-center justify-end gap-1 text-red-500">
                          <FiLock size={12} />
                          <span className="text-[8px] font-black uppercase">
                            Locked
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          {item.unitType === "kg" || item.unitType === "l" ? (
                            <button
                              onClick={() => {
                                const current = returnQtys[item.itemId] || 0;
                                const newVal =
                                  current === 0 ? maxRefundable : 0;
                                handleQtyChange(
                                  item.itemId,
                                  newVal,
                                  maxRefundable,
                                );
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                (returnQtys[item.itemId] || 0) > 0
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {(returnQtys[item.itemId] || 0) > 0
                                ? "REFUND ALL"
                                : "REFUND"}
                            </button>
                          ) : (
                            <input
                              type="number"
                              value={returnQtys[item.itemId] || ""}
                              max={maxRefundable}
                              min={0}
                              step="1"
                              onWheel={(e) => e.target.blur()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.includes(".")) return;
                                handleQtyChange(
                                  item.itemId,
                                  val,
                                  maxRefundable,
                                );
                              }}
                              placeholder="0"
                              className="w-24 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-brand-pink rounded-xl p-2 text-center font-black text-sm transition-all outline-none"
                            />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Reason Selection */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
              Reason for Adjustment
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 rounded-xl p-3 text-xs font-black uppercase tracking-widest border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-pink/20"
            >
              <option>Customer Return</option>
              <option>Damaged Goods</option>
              <option>Pricing Dispute</option>
              <option>Order Correction</option>
            </select>
          </div>

          {/* Real-time Preview */}
          <div className="bg-gray-900 dark:bg-brand-pink p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
            <div className="text-center md:text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">
                Total Credit Value
              </p>
              <h3 className="text-4xl font-black tracking-tighter font-mono italic">
                Nu.{" "}
                {grandTotalRefund.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
            <div className="flex gap-8 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
              <div className="text-center">
                <p className="text-[8px] font-bold uppercase opacity-50 mb-1">
                  Tax Base
                </p>
                <p className="font-mono font-black text-xs">
                  Nu. {refundDetails.taxable.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-bold uppercase opacity-50 mb-1">
                  GST Reversed
                </p>
                <p className="font-mono font-black text-xs text-white">
                  Nu. {refundDetails.gst.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 flex items-center gap-2 text-gray-400">
            <FiAlertCircle size={14} />
            <p className="text-[8px] font-bold uppercase tracking-tight leading-tight">
              Submitting this will generate a permanent Credit Note and update
              monthly tax liabilities.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || grandTotalRefund <= 0}
              className="flex-1 md:flex-none bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 shadow-xl"
            >
              {isSubmitting ? (
                <FiRefreshCcw className="animate-spin" />
              ) : (
                <FiRefreshCcw />
              )}
              {isSubmitting ? "Syncing..." : "Issue Refund"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
