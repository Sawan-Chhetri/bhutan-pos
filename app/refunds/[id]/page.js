"use client";
import { useEffect, useState, use, useContext } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import {
  FiArrowLeft,
  FiPrinter,
  FiHash,
  FiCalendar,
  FiAlertCircle,
  FiExternalLink,
  FiArrowRight,
} from "react-icons/fi";
import Link from "next/link";
import usePermissions from "@/hooks/usePermissions";
import { UserContext } from "@/contexts/UserContext";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import RefundReceipt80mm from "@/components/receipt/RefundReceipt80mm";

// --- PROFESSIONAL CREDIT NOTE STYLING ---
const cnStyles = StyleSheet.create({
  page: { padding: 50, backgroundColor: "#FFFFFF", fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 3,
    borderBottomColor: "#EF4444", // Red for reversal
    paddingBottom: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "black",
    textTransform: "uppercase",
    letterSpacing: -1,
    color: "#EF4444",
  },
  metaLabel: {
    fontSize: 8,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  storeLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "black",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaValue: { fontSize: 10, fontWeight: "bold", marginBottom: 8 },

  // Reference Box (Linking to Original Invoice)
  refBox: {
    backgroundColor: "#FEF2F2",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Table Styling
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 8,
    marginBottom: 10,
  },
  th: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  td: { fontSize: 9 },
  qtyCol: { color: "#EF4444", fontWeight: "bold" },

  totalsArea: { marginTop: 40, alignSelf: "flex-end", width: 200 },
  totalRow: {
    flexDirection: "row",
    justifyBetween: "space-between",
    marginBottom: 5,
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#EF4444",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 7,
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
});

const CreditNotePDF = ({ refund }) => (
  <Document>
    <Page size="A4" style={cnStyles.page}>
      {/* Header */}
      <View style={cnStyles.header}>
        <View style={{ maxWidth: "70%" }}>
          <Text style={cnStyles.title}>CREDIT NOTE</Text>
          <Text style={[cnStyles.storeLabel, { marginTop: 4 }]}>
            {refund.store.name}
          </Text>
          <Text style={[cnStyles.metaLabel, { marginTop: 4 }]}>
            Address: {refund.store.address}
          </Text>
          <Text style={[cnStyles.metaLabel, { marginTop: 4 }]}>
            Phone: {refund.store.phone}
          </Text>
          <Text style={[cnStyles.metaLabel, { marginTop: 4 }]}>
            GST TPN: {refund.store.tpn}
          </Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={cnStyles.metaLabel}>Reference Number</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            {refund.refundInvoiceNumber}
          </Text>
          <Text style={[cnStyles.metaLabel, { marginTop: 8 }]}>
            Date Issued
          </Text>
          <Text style={{ fontSize: 10, fontWeight: "bold" }}>
            {new Date(refund.date).toLocaleDateString("en-GB")}
          </Text>
        </View>
      </View>

      {/* Reference Box */}
      <View style={cnStyles.refBox}>
        <View>
          <Text style={cnStyles.metaLabel}>Adjustment For Invoice</Text>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>
            #{refund.originalInvoiceNumber}
          </Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={cnStyles.metaLabel}>Reason for Return</Text>
          <Text style={{ fontSize: 10, fontWeight: "bold", color: "#B91C1C" }}>
            {refund.reason?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={cnStyles.tableHeader}>
        <Text style={[cnStyles.th, { flex: 3 }]}>Returned Item</Text>
        <Text style={[cnStyles.th, { flex: 1, textAlign: "center" }]}>Qty</Text>
        <Text style={[cnStyles.th, { flex: 1, textAlign: "right" }]}>
          Price
        </Text>
        <Text style={[cnStyles.th, { flex: 1, textAlign: "right" }]}>
          Total
        </Text>
      </View>

      {refund.items.map((item, i) => (
        <View key={i} style={cnStyles.row}>
          <View style={{ flex: 3 }}>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              {item.name.toUpperCase()}
            </Text>
            {item.isGSTExempt && (
              <Text style={{ fontSize: 7, color: "#9CA3AF" }}>Tax Exempt</Text>
            )}
          </View>
          <Text
            style={[
              cnStyles.td,
              cnStyles.qtyCol,
              { flex: 1, textAlign: "center" },
            ]}
          >
            -{item.qty}
            {item.unitType === "default" ? "" : ` ${item.unitType}`}
          </Text>
          <Text style={[cnStyles.td, { flex: 1, textAlign: "right" }]}>
            {item.unitPrice?.toLocaleString()}
          </Text>
          <Text
            style={[
              cnStyles.td,
              { flex: 1, textAlign: "right", fontWeight: "bold" },
            ]}
          >
            {item.lineTotal?.toLocaleString()}
          </Text>
        </View>
      ))}

      {/* Totals Section */}
      <View style={cnStyles.totalsArea}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <Text style={cnStyles.metaLabel}>Subtotal Reversed</Text>
          <Text style={cnStyles.td}>
            Nu. {refund.subtotal?.toLocaleString()}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <Text style={cnStyles.metaLabel}>GST Reclaimed</Text>
          <Text style={cnStyles.td}>
            Nu. {refund.gstAmount?.toLocaleString()}
          </Text>
        </View>
        <View
          style={[
            cnStyles.grandTotal,
            { flexDirection: "row", justifyContent: "space-between" },
          ]}
        >
          <Text style={{ fontSize: 10, fontWeight: "bold" }}>TOTAL REFUND</Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#EF4444" }}>
            Nu.{" "}
            {refund.totalAmount?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      <Text style={cnStyles.footer}>
        This is a formal tax adjustment document referencing invoice #
        {refund.originalInvoiceNumber}.
      </Text>
    </Page>
  </Document>
);

export default function RefundDetailPage({ params }) {
  const { id } = use(params);
  const { idToken } = useAuthStatus();
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const permissions = usePermissions(user);

  useEffect(() => {
    if (!idToken) return;
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/refunds/${id}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json();
        setRefund(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, idToken]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            Loading Reversal Data
          </p>
        </div>
      </div>
    );

  if (!refund)
    return (
      <div className="min-h-screen flex items-center justify-center p-12">
        <div className="bg-red-50 text-red-500 p-8 rounded-[2rem] border border-red-100 font-black uppercase text-center">
          Error: Credit Note Not Found
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* --- TOP NAVIGATION BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 no-print">
          <Link
            href="/refunds"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-pink transition-all"
          >
            <FiArrowLeft /> Back to Ledger
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {/* THE NEW LINK: VIEW ORIGINAL INVOICE */}
              <Link
                href={`/invoice/${refund.originalSaleId}`}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
              >
                <FiExternalLink /> View Original Sale
              </Link>

              {/* Add the Download PDF Button */}
              <PDFDownloadLink
                document={<CreditNotePDF refund={refund} />}
                fileName={`CN-${refund.refundInvoiceNumber}.pdf`}
              >
                {({ loading }) => (
                  <button className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                    {loading ? "Syncing..." : "Download PDF"}
                  </button>
                )}
              </PDFDownloadLink>
            </div>

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

        {/* --- DOCUMENT CONTAINER --- */}
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden print:shadow-none print:border-none">
          {/* Status Banner */}
          <div className="bg-red-500 py-3 text-center">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
              Official Credit Note / Tax Reversal
            </p>
          </div>

          <div className="p-8 md:p-16">
            {/* Identity Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
              <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 dark:text-white leading-none">
                  Credit <span className="text-red-500 italic">Note</span>
                </h1>
                <div className="space-y-2">
                  <p className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase">
                    <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <FiHash className="text-red-500" />
                    </span>
                    {refund.refundInvoiceNumber}
                  </p>
                  <p className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase">
                    <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <FiCalendar className="text-red-500" />
                    </span>
                    {new Date(refund.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-2xl font-black uppercase dark:text-white leading-tight mb-1">
                  {refund.store.name}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider max-w-[200px] ml-auto">
                  {refund.store.address}
                </p>
                <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  {refund.store.phone}
                </p>
                <div className="mt-4 py-2 px-4 bg-red-50 dark:bg-red-950/30 rounded-full inline-block">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                    GST TPN: {refund.store.tpn}
                  </p>
                </div>
              </div>
            </div>

            {/* Reference & Reason Box */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={`/invoice/${refund.originalSaleId}`}
                className="group p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-brand-pink transition-all"
              >
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Referencing Invoice
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-brand-pink transition-colors">
                    #{refund.originalInvoiceNumber}
                  </p>
                  <FiArrowRight className="text-gray-300 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <div className="p-6 bg-red-50/30 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">
                  Return Reason
                </p>
                <p className="text-sm font-black text-red-600 uppercase italic">
                  {refund.reason}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-12">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50 dark:border-gray-800">
                  <th className="pb-4 text-left">Returned Product</th>
                  <th className="pb-4 text-center">Qty</th>
                  <th className="pb-4 text-right">Unit Price</th>
                  <th className="pb-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {refund.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-6">
                      <p className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter">
                        {item.name}
                      </p>
                      {item.isGSTExempt && (
                        <span className="text-[8px] font-black text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-md mt-1 inline-block">
                          TAX EXEMPT
                        </span>
                      )}
                    </td>
                    <td className="py-6 text-center font-mono font-black text-red-500">
                      -{item.qty}{" "}
                      {item.unitType === "default" ? "" : item.unitType}
                    </td>
                    <td className="py-6 text-right font-mono text-xs text-gray-500">
                      Nu. {item.unitPrice?.toLocaleString()}
                    </td>
                    <td className="py-6 text-right font-mono font-black text-gray-900 dark:text-white">
                      Nu. {item.lineTotal?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Section */}
            <div className="flex justify-end pt-8 border-t-2 border-gray-900 dark:border-white">
              <div className="w-full max-w-xs space-y-4">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                  <span>Subtotal Reversed</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    Nu. {refund.subtotal?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                  <span>GST Reclaimed</span>
                  <span className="text-brand-pink font-mono">
                    Nu. {refund.gstAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-black uppercase dark:text-white">
                    Refund Total
                  </span>
                  <span className="text-4xl font-black font-mono tracking-tighter text-red-600">
                    Nu.{" "}
                    {refund.totalAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Formal Footer */}
            <div className="mt-24 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
              <div className="flex items-center gap-4 opacity-30">
                <FiAlertCircle size={32} />
                <p className="text-[8px] font-black uppercase leading-tight tracking-widest">
                  Official Credit Ledger Entry
                  <br />
                  System Generated Document
                </p>
              </div>
              <div className="w-48">
                <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4"></div>
                <p className="text-[9px] font-black text-gray-400 uppercase text-center tracking-widest">
                  Store Stamp / Sign
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {permissions.canPrintReceipts && <RefundReceipt80mm refund={refund} />}
    </div>
  );
}
