"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * 80mm Thermal Receipt for Credit Notes / Refunds
 */
export default function RefundReceipt80mm({ refund }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => {
      clearTimeout(t);
      setMounted(false);
    };
  }, []);

  if (!refund) return null;

  const receiptContent = (
    <>
      <style jsx global>{`
        .refund-receipt {
          display: none;
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body > *:not(#thermal-print-portal) {
            display: none !important;
          }

          #thermal-print-portal {
            display: block !important;
            width: 80mm !important;
            background: white !important;
            color: black !important;
          }

          .refund-receipt {
            display: block !important;
            width: 80mm !important;
            padding: 5mm !important;
            font-family: "Courier New", Courier, monospace !important;
            line-height: 1.2 !important;
          }
        }
      `}</style>

      <div className="refund-receipt">
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "900",
              margin: 0,
              border: "2px solid #000",
              padding: "2px",
            }}
          >
            CREDIT NOTE
          </h2>
          <p style={{ fontSize: "11px", fontWeight: "900", marginTop: "5px" }}>
            {refund.store?.name}
          </p>
          <p style={{ fontSize: "10px", fontWeight: "600" }}>
            TPN: {refund.store?.tpn}
          </p>
        </div>

        {/* METADATA */}
        <div
          style={{
            fontSize: "11px",
            borderBottom: "1px dashed #000",
            paddingBottom: "5px",
            marginBottom: "5px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "900",
            }}
          >
            <span>CN NO: {refund.refundInvoiceNumber}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>DATE:</span>
            <span>{new Date(refund.date).toLocaleDateString("en-GB")}</span>
          </div>
          <div
            style={{
              fontWeight: "900",
              marginTop: "4px",
              borderTop: "1px solid #000",
              paddingTop: "4px",
            }}
          >
            REF INV: #{refund.originalInvoiceNumber}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <table
          style={{
            width: "100%",
            fontSize: "11px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <th style={{ textAlign: "left", padding: "4px 0" }}>
                RETURNED ITEM
              </th>
              <th style={{ textAlign: "right", padding: "4px 0" }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {refund.items?.map((item, i) => (
              <tr key={i} style={{ verticalAlign: "top" }}>
                <td style={{ padding: "6px 0", fontWeight: "600" }}>
                  {item.name?.toUpperCase()} <br />
                  <span style={{ fontSize: "10px" }}>
                    Qty: -{item.qty} @ {item.unitPrice?.toLocaleString()}
                  </span>
                </td>
                <td
                  style={{
                    textAlign: "right",
                    padding: "6px 0",
                    fontWeight: "900",
                  }}
                >
                  -{item.lineTotal?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS SECTION */}
        <div
          style={{
            marginTop: "10px",
            borderTop: "1px dashed #000",
            paddingTop: "5px",
            fontSize: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "600",
            }}
          >
            <span>SUBTOTAL REVERSED:</span>
            <span>{Number(refund.subtotal || 0).toLocaleString()}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "600",
            }}
          >
            <span>GST RECLAIMED:</span>
            <span>{Number(refund.gstAmount || 0).toLocaleString()}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "900",
              fontSize: "15px",
              marginTop: "5px",
              borderTop: "2px solid #000",
              paddingTop: "5px",
            }}
          >
            <span>TOTAL REFUND:</span>
            <span>Nu. {Number(refund.totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* REASON & FOOTER */}
        <div
          style={{
            marginTop: "15px",
            fontSize: "10px",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          <p style={{ textTransform: "uppercase" }}>REASON: {refund.reason}</p>
          <div
            style={{
              marginTop: "15px",
              borderTop: "1px solid #eee",
              paddingTop: "10px",
            }}
          >
            <p>--- REVERSAL COMPLETE ---</p>
            <p>Powered by SwiftGST</p>
          </div>
        </div>
      </div>
    </>
  );

  if (!mounted || typeof document === "undefined") return null;

  let portalDiv = document.getElementById("thermal-print-portal");
  if (!portalDiv) {
    portalDiv = document.createElement("div");
    portalDiv.id = "thermal-print-portal";
    document.body.appendChild(portalDiv);
  }

  return createPortal(receiptContent, portalDiv);
}
