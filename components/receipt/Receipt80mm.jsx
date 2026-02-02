"use client";

import React from "react";

/**
 * Reusable 80mm Thermal Receipt Component
 * 
 * @param {Object} invoice - The invoice data object containing store, items, and totals.
 */
export default function Receipt80mm({ invoice }) {
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

  return (
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

          body * {
            visibility: hidden;
          }

          .thermal-receipt,
          .thermal-receipt * {
            visibility: visible;
          }

          .thermal-receipt {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5mm;
            background: white;
            color: black;
            font-family: "Courier New", Courier, monospace;
            line-height: 1.2;
          }
        }
      `}</style>

      <div className="thermal-receipt">
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "900", margin: 0 }}>
            {invoice.store?.name}
          </h2>
          <p style={{ fontSize: "10px", margin: "2px 0" }}>
            {invoice.store?.address}
          </p>
          <p style={{ fontSize: "10px", fontWeight: "bold" }}>
            TPN: {invoice.store?.gstNumber}
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>INV: #{invoice.invoiceNumber}</span>
            <span>{formattedDate}</span>
          </div>
          <div>CUST: {invoice.customerName || "Walk-in"}</div>
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
            {invoice.items?.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: "4px 0" }}>
                  {item.name?.charAt(0).toUpperCase() + item.name?.slice(1)} <br />
                  <span style={{ fontSize: "9px" }}>
                    {item.qty} x {item.unitPrice?.toLocaleString()}
                  </span>
                </td>
                <td
                  style={{
                    textAlign: "right",
                    verticalAlign: "top",
                    padding: "4px 0",
                  }}
                >
                  {(item.qty * item.unitPrice)?.toLocaleString()}
                </td>
              </tr>
            ))}
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>SUBTOTAL:</span>
            <span>{invoice.subtotal?.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>GST (5%):</span>
            <span>{invoice.gst?.toLocaleString()}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "900",
              fontSize: "14px",
              marginTop: "5px",
            }}
          >
            <span>TOTAL:</span>
            <span>Nu. {invoice.total?.toLocaleString()}</span>
          </div>
        </div>

        <div
          style={{ textAlign: "center", marginTop: "15px", fontSize: "9px" }}
        >
          <p>--- THANK YOU ---</p>
          <p>Powered by SwiftGST</p>
        </div>
      </div>
    </>
  );
}
