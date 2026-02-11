import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Reusable 80mm Thermal Receipt Component
 *
 * @param {Object} invoice - The invoice data object containing store, items, and totals.
 */
export default function Receipt80mm({ invoice }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid calling setState synchronously inside the effect body to satisfy
    // react-hooks linting (use a microtask instead).
    const t = setTimeout(() => setMounted(true), 0);
    return () => {
      clearTimeout(t);
      setMounted(false);
    };
  }, []);

  if (!invoice) return null;

  // Format date if it's a Firestore timestamp or raw string
  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date;

    if (date?._seconds) {
      const d = new Date(date._seconds * 1000);
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d);
    }
    return String(date);
  };

  const formattedDate = formatDate(invoice.date);

  const receiptContent = (
    <>
      <style jsx global>{`
        /* Thermal Receipt Print Styles */
        .thermal-receipt {
          display: none;
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          /* Hide everything in the body except our portal content */
          body > *:not(#thermal-print-portal) {
            display: none !important;
          }

          html,
          body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 80mm !important;
          }

          #thermal-print-portal {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            background: white !important;
            color: black !important;
            visibility: visible !important;
          }

          .thermal-receipt {
            display: block !important;
            width: 80mm !important;
            padding: 5mm !important;
            background: white !important;
            color: black !important;
            font-family: "Courier New", Courier, monospace !important;
            line-height: 1.2 !important;
            visibility: visible !important;
          }

          .thermal-receipt * {
            visibility: visible !important;
          }
        }
      `}</style>

      <div className="thermal-receipt">
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "900", margin: 0 }}>
            {invoice.store?.name}
          </h2>
          <p style={{ fontSize: "10px", fontWeight: "600", margin: "2px 0" }}>
            {invoice.store?.address}
          </p>
          <p style={{ fontSize: "10px", fontWeight: "bold" }}>
            GST TPN: {invoice.store?.gstNumber}
          </p>
        </div>

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
              fontWeight: "600",
            }}
          >
            <span>INV: #{invoice.invoiceNumber}</span>
            <span>{formattedDate}</span>
          </div>
          <div style={{ fontWeight: "600" }}>
            CUST: {invoice.customerName || "Walk-in"}
          </div>
          {(invoice.customerCID || invoice.contact) && (
            <div
              style={{
                fontSize: "10px",
                marginTop: "2px",
                borderTop: "1px dotted #000",
                paddingTop: "2px",
              }}
            >
              {invoice.customerCID && <div>CID: {invoice.customerCID}</div>}
              {invoice.contact && <div>Contact: {invoice.contact}</div>}
            </div>
          )}
        </div>

        <table
          style={{
            width: "100%",
            fontSize: "11px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <th style={{ textAlign: "left", padding: "4px 0" }}>ITEM</th>
              <th style={{ textAlign: "right", padding: "4px 0" }}>AMT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, i) => {
              const hasItemDiscount = (item.discountPercent || 0) > 0;
              const unitPrice = Number(item.unitPrice || 0);
              const effectivePrice = Number(
                item.effectiveUnitPrice ||
                  unitPrice * (1 - (item.discountPercent || 0) / 100),
              );

              return (
                <tr key={i}>
                  <td style={{ padding: "4px 0", fontWeight: "600" }}>
                    {item.name?.charAt(0).toUpperCase() + item.name?.slice(1)}
                    {item.isGSTExempt ? " [E]" : ""} <br />
                    <span style={{ fontSize: "9px", fontWeight: "600" }}>
                      {item.qty}
                      {item.unitType !== "unit" ? item.unitType : ""} x{" "}
                      {unitPrice.toLocaleString()}
                      {hasItemDiscount && ` (-${item.discountPercent}%)`}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      verticalAlign: "top",
                      padding: "4px 0",
                      fontWeight: "600",
                    }}
                  >
                    {(item.qty * effectivePrice).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

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
            <span>NET SUBTOTAL:</span>
            <span>{Number(invoice.subtotal || 0).toLocaleString()}</span>
          </div>

          {invoice.globalDiscount &&
            Number(invoice.globalDiscount.value || 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "600",
                }}
              >
                <span>
                  DISCOUNT (
                  {invoice.globalDiscount.type === "percent"
                    ? `${invoice.globalDiscount.value}%`
                    : "FIXED"}
                  ):
                </span>
                <span>
                  -
                  {(invoice.globalDiscount.type === "percent"
                    ? (Number(invoice.subtotal || 0) *
                        Number(invoice.globalDiscount.value)) /
                      100
                    : Number(invoice.globalDiscount.value)
                  ).toLocaleString()}
                </span>
              </div>
            )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "600",
            }}
          >
            <span>GST (5%):</span>
            <span>{Number(invoice.gst || 0).toLocaleString()}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "900",
              fontSize: "14px",
              marginTop: "5px",
              borderTop: "1px solid #000",
              paddingTop: "5px",
            }}
          >
            <span>GRAND TOTAL:</span>
            <span>Nu. {Number(invoice.total || 0).toLocaleString()}</span>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "9px",
            fontWeight: "600",
          }}
        >
          <p>--- THANK YOU ---</p>
          <p>Powered by SwiftGST</p>
        </div>
      </div>
    </>
  );

  // If not mounted or no document, we can't use portal
  if (!mounted || typeof document === "undefined") return null;

  // Create or get the print portal div
  let portalDiv = document.getElementById("thermal-print-portal");
  if (!portalDiv) {
    portalDiv = document.createElement("div");
    portalDiv.id = "thermal-print-portal";
    document.body.appendChild(portalDiv);
  }

  return createPortal(receiptContent, portalDiv);
}
