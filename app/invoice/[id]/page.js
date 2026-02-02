// "use client";

// import { useParams } from "next/navigation";

// import { useEffect, useState, useRef } from "react";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import authFetch from "@/lib/authFetch";
// import {
//   PDFDownloadLink,
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Font,
// } from "@react-pdf/renderer";

// export default function InvoicePage() {
//   const { id } = useParams();
//   const [invoice, setInvoice] = useState(null);
//   const { idToken } = useAuthStatus();
//   const [loading, setLoading] = useState(true);
//   const invoiceRef = useRef();

//   useEffect(() => {
//     if (!id || !idToken) return;

//     const fetchInvoice = async () => {
//       try {
//         setLoading(true);
//         const res = await authFetch(`/api/sales/${id}`, {}, idToken);

//         if (!res.ok) throw new Error("Failed to fetch invoice");

//         const data = await res.json();

//         const formatter = new Intl.DateTimeFormat("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         });

//         let saleDate = data.date;

//         // Firestore Timestamp
//         if (data.date?._seconds) {
//           const d = new Date(data.date._seconds * 1000);
//           saleDate = formatter.format(d); // 20 Aug 2026
//         }

//         saleDate = saleDate.replace(/ /g, " ");

//         setInvoice({
//           ...data,
//           date: saleDate,
//         });
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInvoice();
//   }, [id, idToken]);

//   // PDF Styles
//   const pdfStyles = StyleSheet.create({
//     page: {
//       backgroundColor: "#fff",
//       color: "#222",
//       padding: 32,
//       fontSize: 12,
//       fontFamily: "Helvetica",
//     },
//     header: {
//       borderBottom: "1px solid #eee",
//       marginBottom: 16,
//       paddingBottom: 8,
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "flex-start",
//     },
//     business: {},
//     title: {
//       fontSize: 18,
//       fontWeight: "bold",
//       color: "#2563eb",
//       marginBottom: 2,
//     },
//     meta: {
//       textAlign: "right",
//     },
//     section: {
//       marginBottom: 16,
//     },
//     table: {
//       width: "100%",
//       border: "1px solid #eee",
//       borderRadius: 6,
//       overflow: "hidden",
//     },
//     tableHeader: {
//       flexDirection: "row",
//       backgroundColor: "#e0e7ff",
//     },
//     th: {
//       flex: 1,
//       fontWeight: "bold",
//       color: "#2563eb",
//       padding: 6,
//       fontSize: 12,
//     },
//     td: {
//       flex: 1,
//       padding: 6,
//       fontSize: 12,
//     },
//     row: {
//       flexDirection: "row",
//       borderBottom: "1px solid #eee",
//     },
//     total: {
//       fontWeight: "bold",
//       color: "#2563eb",
//       fontSize: 14,
//       marginTop: 8,
//     },
//     thanks: {
//       textAlign: "center",
//       color: "#888",
//       marginTop: 24,
//       fontSize: 11,
//     },
//   });

//   // PDF Document Component
//   const InvoicePDF = ({ invoice }) => (
//     <Document>
//       <Page size="A4" style={pdfStyles.page}>
//         {/* Header */}
//         <View style={pdfStyles.header}>
//           <View style={pdfStyles.business}>
//             <Text style={pdfStyles.title}>{invoice.store.name}</Text>
//             <Text>{invoice.store.address}</Text>
//             <Text>Phone: {invoice.store.phone}</Text>
//           </View>
//           <View style={pdfStyles.meta}>
//             <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//               Tax Invoice
//             </Text>
//             <Text>Invoice #: {invoice.invoiceNumber}</Text>
//             <Text>Date: {invoice.date}</Text>
//           </View>
//         </View>
//         {/* Customer */}
//         <View style={pdfStyles.section}>
//           <Text style={{ color: "#666", fontWeight: "bold" }}>Bill To</Text>
//           <Text style={{ fontSize: 13, fontWeight: "bold", marginTop: 2 }}>
//             {invoice.customerName || "Walk-in Customer"}
//           </Text>
//         </View>
//         {/* Items Table */}
//         <View style={pdfStyles.table}>
//           <View style={pdfStyles.tableHeader}>
//             <Text style={pdfStyles.th}>Item</Text>
//             <Text style={pdfStyles.th}>Qty</Text>
//             <Text style={pdfStyles.th}>Price</Text>
//             <Text style={pdfStyles.th}>Total</Text>
//           </View>
//           {invoice.items.map((item, idx) => (
//             <View style={pdfStyles.row} key={idx}>
//               <Text style={pdfStyles.td}>{item.name}</Text>
//               <Text style={pdfStyles.td}>{item.qty}</Text>
//               <Text style={pdfStyles.td}>
//                 Nu. {parseInt(item.unitPrice).toFixed(2)}
//               </Text>
//               <Text style={pdfStyles.td}>
//                 Nu. {(item.qty * parseInt(item.unitPrice)).toFixed(2)}
//               </Text>
//             </View>
//           ))}
//         </View>
//         {/* Totals */}
//         <View style={pdfStyles.section}>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               marginTop: 8,
//             }}
//           >
//             <Text>Subtotal</Text>
//             <Text>Nu. {invoice.subtotal.toFixed(2)}</Text>
//           </View>
//           <View
//             style={{ flexDirection: "row", justifyContent: "space-between" }}
//           >
//             <Text>GST (5%)</Text>
//             <Text>Nu. {invoice.gst.toFixed(2)}</Text>
//           </View>
//           <View
//             style={{
//               borderTop: "1px solid #eee",
//               marginTop: 6,
//               marginBottom: 6,
//             }}
//           />
//           <View
//             style={{ flexDirection: "row", justifyContent: "space-between" }}
//           >
//             <Text style={pdfStyles.total}>Total</Text>
//             <Text style={pdfStyles.total}>Nu. {invoice.total.toFixed(2)}</Text>
//           </View>
//         </View>
//         {/* Footer */}
//         <Text style={pdfStyles.thanks}>
//           Thank you for shopping with {invoice.store.name}
//         </Text>
//       </Page>
//     </Document>
//   );

//   if (loading)
//     return (
//       <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
//         Loading invoice...
//       </div>
//     );
//   if (!invoice)
//     return (
//       <div className="flex justify-center items-center min-h-screen text-lg text-red-500">
//         Invoice not found
//       </div>
//     );

//   return (
//     <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 min-h-screen flex flex-col items-center">
//       {invoice && (
//         <PDFDownloadLink
//           document={<InvoicePDF invoice={invoice} />}
//           fileName={`Invoice-${invoice.invoiceNumber || id}.pdf`}
//         >
//           {({ loading: pdfLoading }) => (
//             <button
//               className="mb-6 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
//               disabled={pdfLoading}
//             >
//               {pdfLoading ? "Preparing PDF..." : "Save as PDF"}
//             </button>
//           )}
//         </PDFDownloadLink>
//       )}
//       {/* On-screen invoice card (visible) */}
//       <div
//         ref={invoiceRef}
//         className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl p-8 border border-blue-100 dark:border-blue-900 relative overflow-hidden"
//         style={{ minHeight: 600 }}
//       >
//         {/* Decorative Accent */}
//         <div
//           className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900 rounded-bl-3xl z-0"
//           style={{ opacity: 0.15 }}
//         />
//         {/* Header */}
//         <div className="flex justify-between items-start border-b pb-6 mb-8 dark:border-gray-700 relative z-10">
//           {/* Business Info */}
//           <div>
//             <h1 className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight">
//               {invoice.store.name}
//             </h1>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {invoice.store.address}
//             </p>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               Phone: {invoice.store.phone}
//             </p>
//           </div>
//           {/* Invoice Meta */}
//           <div className="text-right">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//               Tax Invoice
//             </h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Invoice #: {invoice.invoiceNumber}
//             </p>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Date: {invoice.date}
//             </p>
//           </div>
//         </div>
//         {/* Customer */}
//         <div className="mb-8 relative z-10">
//           <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
//             Bill To
//           </h3>
//           <p className="text-gray-900 dark:text-white font-semibold text-lg">
//             {invoice.customerName || "Walk-in Customer"}
//           </p>
//         </div>
//         {/* Items Table */}
//         <div className="overflow-x-auto relative z-10">
//           <table className="min-w-full border rounded-lg overflow-hidden shadow-sm">
//             <thead className="bg-blue-50 dark:bg-blue-900">
//               <tr>
//                 <th className="px-4 py-2 text-left text-sm font-bold text-blue-700 dark:text-blue-200">
//                   Item
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-bold text-blue-700 dark:text-blue-200">
//                   Qty
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-bold text-blue-700 dark:text-blue-200">
//                   Price
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-bold text-blue-700 dark:text-blue-200">
//                   Total
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoice.items.map((item, index) => (
//                 <tr
//                   key={index}
//                   className="border-b last:border-b-0 dark:border-gray-700"
//                 >
//                   <td className="px-4 py-3 text-gray-900 dark:text-white">
//                     {item.name}
//                   </td>
//                   <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
//                     {item.qty}
//                   </td>
//                   <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
//                     Nu. {parseInt(item.unitPrice).toFixed(2)}
//                   </td>
//                   <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
//                     Nu. {(item.qty * parseInt(item.unitPrice)).toFixed(2)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {/* Totals */}
//         <div className="mt-8 space-y-2 relative z-10">
//           <div className="flex justify-between text-gray-700 dark:text-gray-300">
//             <span>Subtotal</span>
//             <span>Nu. {invoice.subtotal.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between text-gray-700 dark:text-gray-300">
//             <span>GST (5%)</span>
//             <span>Nu. {invoice.gst.toFixed(2)}</span>
//           </div>
//           <hr className="border-gray-300 dark:border-gray-600" />
//           <div className="flex justify-between text-xl font-bold text-blue-700 dark:text-blue-200">
//             <span>Total</span>
//             <span>Nu. {invoice.total.toFixed(2)}</span>
//           </div>
//         </div>
//         {/* Footer */}
//         <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400 relative z-10">
//           Thank you for shopping with{" "}
//           <span className="font-semibold text-blue-700 dark:text-blue-300">
//             {invoice.store.name}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import {
  FiDownload,
  FiPrinter,
  FiArrowLeft,
  FiHash,
  FiCalendar,
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

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const { idToken } = useAuthStatus();
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
const permissions = usePermissions(user);

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
        if (data.date?._seconds) {
          const d = new Date(data.date._seconds * 1000);
          saleDate = formatter.format(d);
        }
        setInvoice({ ...data, date: saleDate });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, idToken]);

  // PDF Styles (Optimized for professional printing)
  const pdfStyles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#111827",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
      borderBottom: 2,
      borderBottomColor: "#A8DF8E",
      paddingBottom: 20,
    },
    brand: { fontSize: 20, fontWeight: "bold", color: "#A8DF8E" },
    address: { color: "#6B7280", fontSize: 9, marginTop: 4 },
    metaBox: { textAlign: "right" },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 4,
      textTransform: "uppercase",
    },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 8,
      color: "#9CA3AF",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 4,
    },
    table: { marginTop: 10 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#F9FAFB",
      borderBottom: 1,
      borderBottomColor: "#A8DF8E",
      padding: 8,
    },
    th: { flex: 1, fontWeight: "bold", color: "#374151" },
    row: {
      flexDirection: "row",
      borderBottom: 1,
      borderBottomColor: "#F3F4F6",
      padding: 8,
    },
    td: { flex: 1 },
    totalsArea: {
      marginTop: 20,
      borderTop: 1,
      borderTopColor: "#E5E7EB",
      paddingTop: 10,
      alignSelf: "flex-end",
      width: 150,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    grandTotal: {
      color: "#A8DF8E",
      fontWeight: "bold",
      fontSize: 12,
      marginTop: 4,
    },
    footer: {
      marginTop: 40,
      textAlign: "center",
      borderTop: 1,
      borderTopColor: "#F3F4F6",
      paddingTop: 20,
      color: "#9CA3AF",
      fontSize: 8,
    },
  });

  const InvoicePDF = ({ invoice }) => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.brand}>
              {invoice.store.name.toUpperCase()}
            </Text>
            <Text style={pdfStyles.address}>{invoice.store.address}</Text>
            <Text style={pdfStyles.address}>Phone: {invoice.store.phone}</Text>
            <Text style={pdfStyles.address}>
              GST TPN: {invoice.store.gstNumber}
            </Text>
          </View>
          <View style={pdfStyles.metaBox}>
            <Text style={pdfStyles.title}>Tax Invoice</Text>
            <Text>Invoice # {invoice.invoiceNumber}</Text>
            <Text>Date: {invoice.date}</Text>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Billed To</Text>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>
            {invoice.customerName || "Walk-in Customer"}
          </Text>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.th, { flex: 2 }]}>Item Description</Text>
            <Text style={pdfStyles.th}>Qty</Text>
            <Text style={pdfStyles.th}>Price</Text>
            <Text style={pdfStyles.th}>Total</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={pdfStyles.row}>
              <View
                style={[
                  pdfStyles.td,
                  { flex: 2, flexDirection: "row", alignItems: "center" },
                ]}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "bold", color: "#111827" }}
                >
                  {item.name.slice(0, 1).toUpperCase() + item.name.slice(1)}
                </Text>
                {item.isGSTExempt && (
                  <Text
                    style={{
                      fontSize: 7,
                      fontWeight: "heavy",
                      color: "#9CA3AF", // Muted Gray
                      marginLeft: 4,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    [EXEMPT]
                  </Text>
                )}
              </View>
              <Text style={pdfStyles.td}>{item.qty}</Text>
              <Text style={pdfStyles.td}>
                {item.unitPrice.toLocaleString()}
              </Text>
              <Text style={pdfStyles.td}>
                {(item.qty * item.unitPrice).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totalsArea}>
          <View style={pdfStyles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{invoice.subtotal.toLocaleString()}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text>GST (5%)</Text>
            <Text>{invoice.gst.toLocaleString()}</Text>
          </View>
          <View style={[pdfStyles.totalRow, pdfStyles.grandTotal]}>
            <Text>TOTAL</Text>
            <Text>Nu. {invoice.total.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={pdfStyles.footer}>
          Thank you for your business. This is a computer-generated invoice.
        </Text>
      </Page>
    </Document>
  );

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen font-black uppercase tracking-[0.3em] animate-pulse">
        Generating Invoice...
      </div>
    );
  if (!invoice)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 font-bold">
        Error: Invoice Not Found
      </div>
    );

  return (
    <div className="p-4 md:p-12 bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col items-center">
      <style jsx global>{`
        /* 1. HIDE RECEIPT ON SCREEN */
        .thermal-receipt {
          display: none;
        }

        @media print {
          /* 2. SET PAGE SIZE TO 80mm */
          @page {
            size: 80mm auto; /* Let height grow dynamically */
            margin: 0;
          }

          /* 3. HIDE EVERYTHING ELSE */
          body * {
            visibility: hidden;
          }

          /* 4. SHOW ONLY THE RECEIPT */
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
            font-family:
              "Courier New", Courier, monospace; /* Clean look for thermal */
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
      {/* Action Bar */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-brand-pink transition-colors"
        >
          <FiArrowLeft /> Back to List
        </Link>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex gap-3">
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} />}
              fileName={`INV-${invoice.invoiceNumber}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                  <FiDownload size={16} />{" "}
                  {pdfLoading ? "Processing..." : "Download PDF"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
          {/* DIRECT PRINT OPTION */}
          {permissions.canPrintReceipts && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8bc36d] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <FiPrinter size={16} /> Print Receipt
            </button>
          )}
        </div>
      </div>

      {/* On-Screen Invoice */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
        {/* Pink Industrial Header Bar */}
        <div className="h-3 bg-brand-pink w-full" />

        <div className="p-8 md:p-16">
          {/* Brand & Meta */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-2">
                {invoice.store.name.toUpperCase()}
              </h1>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed max-w-xs">
                {invoice.store.address} <br />
                <span className="text-gray-700">Phone:</span>{" "}
                {invoice.store.phone} <br />
                <span className="text-gray-700">TPN (GST): </span>{" "}
                {invoice.store.gstNumber}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 min-w-60">
              <h2 className="text-[10px] font-black text-brand-pink uppercase tracking-[0.3em] mb-4">
                Tax Invoice
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Inv No.
                  </span>
                  <span className="text-sm font-black dark:text-white">
                    #{invoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Date
                  </span>
                  <span className="text-sm font-black dark:text-white">
                    {invoice.date}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="mb-12">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Billed To
            </h3>
            <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {invoice.customerName || "Walk-in Customer"}
            </p>
          </div>

          {/* Table */}
          <div className="border border-gray-100 dark:border-gray-800 rounded-3xl overflow-x-auto mb-12">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Item
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Price
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    {/* <td className="px-6 py-5 text-sm font-bold text-gray-800 dark:text-gray-200">
                      {item.name.slice(0, 1).toUpperCase() + item.name.slice(1)}{" "}
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tighter">
                        No GST
                      </span>
                    </td> */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {item.name.charAt(0).toUpperCase() +
                            item.name.slice(1)}
                        </span>
                        {item.isGSTExempt && (
                          <span className="px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Exempt
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-gray-500 font-mono">
                      {item.qty}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-600 dark:text-gray-400 font-mono">
                      {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-gray-900 dark:text-white font-mono">
                      {(item.qty * item.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end">
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Subtotal</span>
                <span className="font-mono">
                  {invoice.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                <span>GST (5%)</span>
                <span className="font-mono">
                  {invoice.gst.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-brand-pink uppercase tracking-widest">
                  Total Nu.
                </span>
                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter font-mono">
                  {invoice.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-20 pt-8 border-t border-gray-50 dark:border-gray-800 text-center">
            <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em]">
              {user?.type === "pos"
                ? `Thank you for shopping with ${invoice.store.name}.`
                : "Thank you"}
            </p>
          </div>
        </div>
      </div>

      {/* HIDDEN THERMAL RECEIPT VIEW */}
      {invoice && <Receipt80mm invoice={invoice} />}
    </div>
  );
}
