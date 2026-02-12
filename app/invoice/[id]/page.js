"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import {
  FiDownload,
  FiPrinter,
  FiArrowLeft,
  FiUser,
  FiRefreshCcw,
  FiCheckCircle,
  FiTag,
  FiInfo,
} from "react-icons/fi";
import Link from "next/link";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { UserContext } from "@/contexts/UserContext";
import usePermissions from "@/hooks/usePermissions";
import Receipt80mm from "@/components/receipt/Receipt80mm";
import RefundModal from "@/components/refunds/RefundModal";

// --- MINIMALIST PROFESSIONAL PDF STYLING ---
const pdfStyles = StyleSheet.create({
  page: { padding: 50, backgroundColor: "#FFFFFF", fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingBottom: 20,
    marginBottom: 30,
  },
  storeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: -0.5,
  },
  metaLabel: {
    fontSize: 8,
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: { fontSize: 10, fontWeight: "bold", marginTop: 2 },

  // Exempt Badge for PDF
  exemptBadge: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    fontSize: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 2,
    alignSelf: "flex-start", // Ensures it doesn't stretch
    fontWeight: "bold",
  },

  // Clean Customer Section
  customerBox: {
    marginBottom: 40,
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 8,
  },
  customerMetaRow: {
    flexDirection: "row",
    gap: 40,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
  customerMetaGroup: {
    flexDirection: "column",
  },

  // Industrial Table Styling
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 5,
    marginBottom: 10,
  },
  th: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEEEEE",
    alignItems: "center",
  },
  td: { fontSize: 10 },

  // Refund Stamp Styling
  stamp: {
    position: "absolute",
    top: 130,
    right: 50,
    padding: 10,
    borderWidth: 3,
    borderRadius: 2,
    transform: "rotate(-12deg)",
    zIndex: 100,
  },

  totalsArea: {
    marginTop: 40,
    alignSelf: "flex-end",
    width: 200,
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  grandTotalText: { fontSize: 16, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 8,
    color: "#999999",
    borderTopWidth: 0.5,
    borderTopColor: "#EEEEEE",
    paddingTop: 10,
  },
});

const InvoicePDF = ({ invoice }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* HEADER */}
      <View style={pdfStyles.header}>
        <View style={{ maxWidth: "70%" }}>
          <Text style={pdfStyles.storeTitle}>{invoice.store.name}</Text>
          <Text style={[pdfStyles.metaLabel, { marginTop: 4 }]}>
            {invoice.store.address}
          </Text>
          <Text style={[pdfStyles.metaLabel, { marginTop: 4 }]}>
            Phone: {invoice.store.phone}
          </Text>
          <Text style={[pdfStyles.metaLabel, { marginTop: 4 }]}>
            GST TPN: {invoice.store.gstNumber}
          </Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            Tax Invoice
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 2 }}>
            #{invoice.invoiceNumber}
          </Text>
          <Text style={pdfStyles.metaLabel}>{invoice.date}</Text>
        </View>
      </View>

      {/* BILLING */}
      <View style={pdfStyles.customerBox}>
        <Text
          style={[
            pdfStyles.metaLabel,
            { color: "#EE4B6A", fontWeight: "bold" },
          ]}
        >
          BILLED TO
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "bold", marginTop: 4 }}>
          {invoice.customerName?.toUpperCase() || "WALK-IN CUSTOMER"}
        </Text>

        {(invoice.customerCID || invoice.contact) && (
          <View style={pdfStyles.customerMetaRow}>
            {invoice.customerCID && (
              <View style={pdfStyles.customerMetaGroup}>
                <Text style={pdfStyles.metaLabel}>CID / LICENSE</Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Courier",
                    fontWeight: "bold",
                    marginTop: 2,
                  }}
                >
                  {invoice.customerCID}
                </Text>
              </View>
            )}
            {invoice.contact && (
              <View style={pdfStyles.customerMetaGroup}>
                <Text style={pdfStyles.metaLabel}>CONTACT</Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Courier",
                    fontWeight: "bold",
                    marginTop: 2,
                  }}
                >
                  {invoice.contact}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* TABLE */}
      <View style={pdfStyles.tableHeader}>
        <Text style={[pdfStyles.th, { flex: 3 }]}>Description</Text>
        <Text style={[pdfStyles.th, { flex: 0.5, textAlign: "center" }]}>
          Qty
        </Text>
        <Text style={[pdfStyles.th, { flex: 1, textAlign: "right" }]}>
          Unit Price
        </Text>
        <Text style={[pdfStyles.th, { flex: 1, textAlign: "right" }]}>
          Total (Nu.)
        </Text>
      </View>

      {invoice.items.map((item, i) => (
        <View key={i} style={pdfStyles.row}>
          <View style={{ flex: 3 }}>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              {item.name.toUpperCase()}
            </Text>
            {item.isGSTExempt && (
              <Text style={pdfStyles.exemptBadge}>EXEMPT</Text>
            )}
          </View>
          <Text style={[pdfStyles.td, { flex: 0.5, textAlign: "center" }]}>
            {item.qty}
            {item.unitType === "default" ? "" : ` ${item.unitType}`}
          </Text>
          <Text style={[pdfStyles.td, { flex: 1, textAlign: "right" }]}>
            {Number(item.unitPrice).toLocaleString()}
          </Text>
          <Text
            style={[
              pdfStyles.td,
              { flex: 1, textAlign: "right", fontWeight: "bold" },
            ]}
          >
            {(
              item.qty * (item.effectiveUnitPrice || item.unitPrice)
            ).toLocaleString()}
          </Text>
        </View>
      ))}

      {/* TOTALS */}
      <View style={pdfStyles.totalsArea}>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.metaLabel}>Subtotal</Text>
          <Text style={pdfStyles.td}>
            {Number(invoice.subtotal).toLocaleString()}
          </Text>
        </View>

        {invoice.gst > 0 && (
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.metaLabel}>GST (5%)</Text>
            <Text style={pdfStyles.td}>
              {Number(invoice.gst).toLocaleString()}
            </Text>
          </View>
        )}

        <View
          style={[
            pdfStyles.totalRow,
            { marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
          ]}
        >
          <Text style={{ fontSize: 10, fontWeight: "bold" }}>GRAND TOTAL</Text>
          <Text style={pdfStyles.grandTotalText}>
            Nu.{" "}
            {Number(invoice.total).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      <Text style={pdfStyles.footer}>
        This is a computer-generated Tax Invoice. Powered by SwiftGST
      </Text>
    </Page>
  </Document>
);

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const { idToken } = useAuthStatus();
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const permissions = usePermissions(user);
  const [refundOpen, setRefundOpen] = useState(false);

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
          month: "long",
          year: "numeric",
        });
        let saleDate = data.date?._seconds
          ? formatter.format(new Date(data.date._seconds * 1000))
          : data.date;
        setInvoice({ ...data, date: saleDate });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, idToken]);

  const handleRefund = async (refundData) => {
    if (!idToken) return;
    try {
      const res = await fetch(`/api/sales/${id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(refundData),
      });
      if (!res.ok) throw new Error("Refund failed");
      window.location.reload();
    } catch (err) {
      alert("Error processing refund.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen font-black uppercase tracking-[0.3em] animate-pulse text-gray-400">
        Loading Record...
      </div>
    );
  if (!invoice)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 font-black">
        Record Not Found
      </div>
    );

  return (
    <div className="p-2 md:p-12 bg-[#F8F9FA] dark:bg-gray-950 min-h-screen flex flex-col items-center">
      <style jsx global>{`
        .thermal-receipt {
          display: none;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>

      {/* --- ACTION BAR --- */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 md:mb-12 no-print">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-pink transition-all"
        >
          <FiArrowLeft /> Back to Ledger
        </Link>

        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setRefundOpen(true)}
            className="px-3 md:px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-all"
          >
            Reversal
          </button>

          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} />}
            fileName={`INV-${invoice.invoiceNumber}.pdf`}
          >
            {({ loading }) => (
              <button className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl bg-gray-900 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg">
                <FiDownload /> {loading ? "Sync..." : "PDF"}
              </button>
            )}
          </PDFDownloadLink>

          {permissions.canPrintReceipts && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl bg-brand-pink text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              <FiPrinter /> Receipt
            </button>
          )}
        </div>
      </div>

      {/* --- UI VIEW (The Industrial UI - Now Responsive) --- */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        <div className="h-2 bg-brand-pink w-full" />

        <div className="p-6 md:p-20">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12 md:mb-20">
            <div className="w-full lg:w-auto">
              <h1 className="text-2xl md:text-5xl lg:text-3xl font-black tracking-tighter italic dark:text-white leading-none mb-4 break-words">
                {invoice.store.name.toUpperCase()}
              </h1>
              <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {invoice.store.address}
              </p>
              <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {invoice.store.phone}
              </p>
              <p className="text-[9px] md:text-[10px] font-black text-brand-pink uppercase mt-1 tracking-widest">
                GST TPN: {invoice.store.gstNumber}
              </p>
            </div>

            <div className="w-full lg:text-right flex flex-col items-start lg:items-end gap-2">
              {/* REFUND STATUS BADGE */}
              {invoice.refundStatus && invoice.refundStatus !== "none" && (
                <div
                  className={`px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 ${
                    invoice.refundStatus === "fully-refunded"
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  <FiRefreshCcw
                    size={10}
                    className={
                      invoice.refundStatus === "fully-refunded"
                        ? "animate-spin-slow"
                        : ""
                    }
                  />
                  {invoice.refundStatus === "fully-refunded"
                    ? "Fully Refunded"
                    : "Partial Return"}
                </div>
              )}

              <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-2">
                <FiCheckCircle /> Verified Sale
              </div>

              <div className="mt-4">
                <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Invoice Ref
                </p>
                <p className="text-2xl md:text-4xl font-mono font-black dark:text-white italic">
                  #{invoice.invoiceNumber}
                </p>
                <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mt-1 italic opacity-60">
                  {invoice.date}
                </p>
              </div>
            </div>
          </div>

          {/* Billed To Card */}
          <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-800/40 rounded-[1.5rem] md:rounded-[2.5rem] mb-10 md:mb-16 border border-gray-100 dark:border-gray-700">
            <p className="text-[8px] md:text-[9px] font-black text-brand-pink uppercase tracking-widest flex items-center gap-2 mb-2">
              <FiUser /> Billed To
            </p>
            <h3 className="text-lg md:text-2xl font-black dark:text-white uppercase tracking-tight">
              {invoice.customerName || "Walk-in Customer"}
            </h3>

            {(invoice.customerCID || invoice.contact) && (
              <div className="mt-6 flex flex-wrap gap-8 md:gap-16 border-t border-dashed border-gray-200 dark:border-gray-700 pt-6">
                {invoice.customerCID && (
                  <div>
                    <p className="text-[9px] font-black text-brand-pink uppercase tracking-widest mb-1">
                      CID / License
                    </p>
                    <p className="text-sm md:text-lg font-mono font-bold dark:text-white text-gray-900">
                      {invoice.customerCID}
                    </p>
                  </div>
                )}
                {invoice.contact && (
                  <div>
                    <p className="text-[9px] font-black text-brand-pink uppercase tracking-widest mb-1">
                      Contact Info
                    </p>
                    <p className="text-sm md:text-lg font-mono font-bold dark:text-white text-gray-900">
                      {invoice.contact}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Items Table - Simplified for Mobile */}
          {/* <div className="overflow-x-auto mb-10 md:mb-16">
            <table className="w-full text-left min-w-[500px] lg:min-w-full">
              <thead className="border-b-2 border-gray-900 dark:border-white">
                <tr>
                  <th className="pb-4 md:pb-6 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Item
                  </th>
                  <th className="pb-4 md:pb-6 text-center text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Qty
                  </th>
                  <th className="pb-4 md:pb-6 text-right text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-6 md:py-8">
                      <span className="text-xs md:text-sm font-black dark:text-gray-100 uppercase tracking-tighter block">
                        {item.name}
                      </span>
                      {item.discountPercent > 0 && (
                        <p className="text-[8px] md:text-[9px] font-bold text-brand-pink mt-1 italic uppercase">
                          Discount -{item.discountPercent}%
                        </p>
                      )}
                    </td>
                    <td className="py-6 md:py-8 text-center font-mono font-black text-gray-500 text-xs md:text-sm">
                      {item.qty}
                    </td>
                    <td className="py-6 md:py-8 text-right font-mono font-black dark:text-white text-xs md:text-sm">
                      {(
                        item.qty * (item.effectiveUnitPrice || item.unitPrice)
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
          {/* Items Table - Now with Refund Indicators */}
          <div className="overflow-x-auto mb-10 md:mb-16">
            <table className="w-full text-left min-w-[500px] lg:min-w-full">
              <thead className="border-b-2 border-gray-900 dark:border-white">
                <tr>
                  <th className="pb-4 md:pb-6 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Item
                  </th>
                  <th className="pb-4 md:pb-6 text-center text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Qty / Unit
                  </th>
                  <th className="pb-4 md:pb-6 text-right text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {invoice.items.map((item, i) => {
                  // Logic to check if this specific item was part of a refund
                  const isRefunded = item.refundedQty > 0;
                  const isFullyRefunded = item.refundedQty >= item.qty;

                  // Determine Unit Label
                  const unitLabel =
                    item.unitType && item.unitType !== "default"
                      ? item.unitType
                      : "";

                  return (
                    <tr key={i} className={isFullyRefunded ? "opacity-50" : ""}>
                      <td className="py-6 md:py-2">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            {/* <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs md:text-sm font-black dark:text-gray-100 uppercase tracking-tighter leading-tight">
                                {item.name}
                              </span>
                              {item.isGSTExempt && (
                                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[8px] font-black text-gray-400 uppercase tracking-widest shrink-0">
                                  Exempt
                                </span>
                              )}
                            </div> */}
                            <div className="py-6">
                              <p className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter">
                                {item.name}
                              </p>
                              {item.isGSTExempt && (
                                <span className="text-[8px] font-black text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-md mt-1 inline-block">
                                  TAX EXEMPT
                                </span>
                              )}
                            </div>

                            {item.discountPercent > 0 && (
                              <p className="text-[8px] md:text-[9px] font-bold text-brand-pink mt-1 italic uppercase">
                                Discount -{item.discountPercent}%
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-6 md:py-8 text-center font-mono font-black text-gray-500 text-xs md:text-sm">
                        <div className="flex flex-col items-center">
                          <span>
                            {item.qty} {unitLabel}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 md:py-8 text-right font-mono font-black dark:text-white text-xs md:text-sm">
                        Nu.{" "}
                        {(
                          item.qty * (item.effectiveUnitPrice || item.unitPrice)
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Calculations */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 pt-8 md:pt-12 border-t border-gray-100 dark:border-gray-800">
            <div className="w-full lg:flex-1">
              {invoice.globalDiscount?.reason && (
                <div className="p-5 md:p-6 bg-red-50/50 dark:bg-red-900/10 rounded-2xl md:rounded-3xl border border-red-100 dark:border-red-900/20 max-w-sm">
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <FiTag size={12} />
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                      Audit Reason
                    </span>
                  </div>
                  <p className="text-[9px] md:text-[10px] font-bold text-gray-600 dark:text-gray-400 italic leading-relaxed">
                    {invoice.globalDiscount.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="w-full lg:w-80 space-y-3 md:y-4">
              <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="dark:text-white font-mono">
                  Nu. {Number(invoice.subtotal).toLocaleString()}
                </span>
              </div>
              {invoice.globalDiscount?.value > 0 && (
                <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black text-brand-pink uppercase tracking-widest">
                  <span>Adjustment</span>
                  <span className="font-mono">
                    - Nu.{" "}
                    {(invoice.globalDiscount.type === "percent"
                      ? (invoice.subtotal * invoice.globalDiscount.value) / 100
                      : invoice.globalDiscount.value
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>GST (5%)</span>
                <span className="dark:text-white font-mono">
                  Nu.{" "}
                  {Number(invoice.gst).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="pt-6 border-t-2 md:border-t-4 border-gray-900 dark:border-white flex justify-between items-end">
                <p className="text-[8px] md:text-[9px] font-black text-brand-pink uppercase tracking-[0.3em]">
                  Total
                </p>
                <span className="text-2xl md:text-4xl font-black dark:text-white tracking-tighter font-mono italic">
                  Nu.{" "}
                  {Number(invoice.total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RefundModal
        invoice={invoice}
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        onRefund={handleRefund}
      />
      {invoice && <Receipt80mm invoice={invoice} />}
    </div>
  );
}
