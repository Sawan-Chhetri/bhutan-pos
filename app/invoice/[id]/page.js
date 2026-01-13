"use client";

import { useParams } from "next/navigation";

import { useEffect, useState, useRef } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const { idToken } = useAuthStatus();
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef();

  useEffect(() => {
    if (!id || !idToken) return;

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`/api/sales/${id}`, {}, idToken);

        if (!res.ok) throw new Error("Failed to fetch invoice");

        const data = await res.json();

        const formatter = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        let saleDate = data.date;

        // Firestore Timestamp
        if (data.date?._seconds) {
          const d = new Date(data.date._seconds * 1000);
          saleDate = formatter.format(d); // 20 Aug 2026
        }

        saleDate = saleDate.replace(/ /g, " ");

        setInvoice({
          ...data,
          date: saleDate,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, idToken]);

  // PDF Styles
  const pdfStyles = StyleSheet.create({
    page: {
      backgroundColor: "#fff",
      color: "#222",
      padding: 32,
      fontSize: 12,
      fontFamily: "Helvetica",
    },
    header: {
      borderBottom: "1px solid #eee",
      marginBottom: 16,
      paddingBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    business: {},
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#2563eb",
      marginBottom: 2,
    },
    meta: {
      textAlign: "right",
    },
    section: {
      marginBottom: 16,
    },
    table: {
      width: "100%",
      border: "1px solid #eee",
      borderRadius: 6,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#e0e7ff",
    },
    th: {
      flex: 1,
      fontWeight: "bold",
      color: "#2563eb",
      padding: 6,
      fontSize: 12,
    },
    td: {
      flex: 1,
      padding: 6,
      fontSize: 12,
    },
    row: {
      flexDirection: "row",
      borderBottom: "1px solid #eee",
    },
    total: {
      fontWeight: "bold",
      color: "#2563eb",
      fontSize: 14,
      marginTop: 8,
    },
    thanks: {
      textAlign: "center",
      color: "#888",
      marginTop: 24,
      fontSize: 11,
    },
  });

  // PDF Document Component
  const InvoicePDF = ({ invoice }) => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.business}>
            <Text style={pdfStyles.title}>{invoice.store.name}</Text>
            <Text>{invoice.store.address}</Text>
            <Text>Phone: {invoice.store.phone}</Text>
          </View>
          <View style={pdfStyles.meta}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Tax Invoice
            </Text>
            <Text>Invoice #: {invoice.invoiceNumber}</Text>
            <Text>Date: {invoice.date}</Text>
          </View>
        </View>
        {/* Customer */}
        <View style={pdfStyles.section}>
          <Text style={{ color: "#666", fontWeight: "bold" }}>Bill To</Text>
          <Text style={{ fontSize: 13, fontWeight: "bold", marginTop: 2 }}>
            {invoice.customerName || "Walk-in Customer"}
          </Text>
        </View>
        {/* Items Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.th}>Item</Text>
            <Text style={pdfStyles.th}>Qty</Text>
            <Text style={pdfStyles.th}>Price</Text>
            <Text style={pdfStyles.th}>Total</Text>
          </View>
          {invoice.items.map((item, idx) => (
            <View style={pdfStyles.row} key={idx}>
              <Text style={pdfStyles.td}>{item.name}</Text>
              <Text style={pdfStyles.td}>{item.qty}</Text>
              <Text style={pdfStyles.td}>
                Nu. {parseInt(item.unitPrice).toFixed(2)}
              </Text>
              <Text style={pdfStyles.td}>
                Nu. {(item.qty * parseInt(item.unitPrice)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
        {/* Totals */}
        <View style={pdfStyles.section}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text>Subtotal</Text>
            <Text>Nu. {invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text>GST (5%)</Text>
            <Text>Nu. {invoice.gst.toFixed(2)}</Text>
          </View>
          <View
            style={{
              borderTop: "1px solid #eee",
              marginTop: 6,
              marginBottom: 6,
            }}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={pdfStyles.total}>Total</Text>
            <Text style={pdfStyles.total}>Nu. {invoice.total.toFixed(2)}</Text>
          </View>
        </View>
        {/* Footer */}
        <Text style={pdfStyles.thanks}>
          Thank you for shopping with {invoice.store.name}
        </Text>
      </Page>
    </Document>
  );

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        Loading invoice...
      </div>
    );
  if (!invoice)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-red-500">
        Invoice not found
      </div>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 min-h-screen flex flex-col items-center">
      {invoice && (
        <PDFDownloadLink
          document={<InvoicePDF invoice={invoice} />}
          fileName={`Invoice-${invoice.invoiceNumber || id}.pdf`}
        >
          {({ loading: pdfLoading }) => (
            <button
              className="mb-6 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              disabled={pdfLoading}
            >
              {pdfLoading ? "Preparing PDF..." : "Save as PDF"}
            </button>
          )}
        </PDFDownloadLink>
      )}
      {/* On-screen invoice card (visible) */}
      <div
        ref={invoiceRef}
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl p-8 border border-blue-100 dark:border-blue-900 relative overflow-hidden"
        style={{ minHeight: 600 }}
      >
        {/* Decorative Accent */}
        <div
          className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900 rounded-bl-3xl z-0"
          style={{ opacity: 0.15 }}
        />
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6 mb-8 dark:border-gray-700 relative z-10">
          {/* Business Info */}
          <div>
            <h1 className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight">
              {invoice.store.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {invoice.store.address}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Phone: {invoice.store.phone}
            </p>
          </div>
          {/* Invoice Meta */}
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tax Invoice
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Invoice #: {invoice.invoiceNumber}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Date: {invoice.date}
            </p>
          </div>
        </div>
        {/* Customer */}
        <div className="mb-8 relative z-10">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Bill To
          </h3>
          <p className="text-gray-900 dark:text-white font-semibold text-lg">
            {invoice.customerName || "Walk-in Customer"}
          </p>
        </div>
        {/* Items Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="min-w-full border rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-blue-50 dark:bg-blue-900">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-bold text-blue-700 dark:text-blue-200">
                  Item
                </th>
                <th className="px-4 py-2 text-left text-sm font-bold text-blue-700 dark:text-blue-200">
                  Qty
                </th>
                <th className="px-4 py-2 text-left text-sm font-bold text-blue-700 dark:text-blue-200">
                  Price
                </th>
                <th className="px-4 py-2 text-left text-sm font-bold text-blue-700 dark:text-blue-200">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b last:border-b-0 dark:border-gray-700"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                    {item.qty}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                    Nu. {parseInt(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    Nu. {(item.qty * parseInt(item.unitPrice)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Totals */}
        <div className="mt-8 space-y-2 relative z-10">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Subtotal</span>
            <span>Nu. {invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>GST (5%)</span>
            <span>Nu. {invoice.gst.toFixed(2)}</span>
          </div>
          <hr className="border-gray-300 dark:border-gray-600" />
          <div className="flex justify-between text-xl font-bold text-blue-700 dark:text-blue-200">
            <span>Total</span>
            <span>Nu. {invoice.total.toFixed(2)}</span>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400 relative z-10">
          Thank you for shopping with{" "}
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            {invoice.store.name}
          </span>
        </div>
      </div>
    </div>
  );
}
