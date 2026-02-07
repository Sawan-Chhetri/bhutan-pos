import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const storeId = searchParams.get("storeId");

    if (!query || !storeId) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    // Since users want to search by invoice number, and our invoice numbers are numeric strings
    // we should look for exact matches or prefix matches.
    // However, the prompt says "grab the data using invoice number"

    // We need to check both sales and refunds collections
    const db = admin.firestore();

    // 1. Search Sales (Invoices)
    // Invoice numbers in Sales are stored as 'invoiceNumber' (number type) or sometimes string?
    // Looking at sales route, invoiceNumber is passed as int.
    // But search input is string. Let's try to parse if it's a number.

    const salesPromise = (async () => {
      const salesRef = db.collection(`stores/${storeId}/sales`);
      // If query is numeric, search exact match on invoiceNumber
      let q = salesRef;
      const numQuery = parseInt(query);

      if (!isNaN(numQuery)) {
        const snap = await salesRef
          .where("invoiceNumber", "==", numQuery)
          .limit(5)
          .get();
        if (!snap.empty) return snap;
      }

      // Also fallback to string search if stored as string or for other fields like customerName?
      // The prompt specifically says "grab the data using invoice number".
      // But let's support robust search if possible, or stick to simple
      return { empty: true, docs: [] };
    })();

    // 2. Search Refunds
    // Refunds store 'refundInvoiceNumber' and 'originalInvoiceNumber'
    const refundsPromise = (async () => {
      const refundsRef = db.collection(`stores/${storeId}/refunds`);
      const numQuery = parseInt(query);

      if (!isNaN(numQuery)) {
        // Search by refund invoice number
        const snap1 = await refundsRef
          .where("refundInvoiceNumber", "==", numQuery)
          .limit(5)
          .get();
        if (!snap1.empty) return snap1;

        // Search by original invoice number
        const snap2 = await refundsRef
          .where("originalInvoiceNumber", "==", numQuery)
          .limit(5)
          .get();
        if (!snap2.empty) return snap2;
      }
      return { empty: true, docs: [] };
    })();

    const [salesSnap, refundsSnap] = await Promise.all([
      salesPromise,
      refundsPromise,
    ]);

    const results = [];

    salesSnap.docs.forEach((doc) => {
      const data = doc.data();
      results.push({
        type: "sale",
        id: doc.id,
        // mapping for common UI
        title: `Invoice #${data.invoiceNumber}`,
        subtitle: data.customerName || "Walk-in Customer",
        amount: data.total || data.finalBeforeTax + data.gst,
        date: data.date?._seconds
          ? new Date(data.date._seconds * 1000).toISOString()
          : data.date,
        status: data.isPaid ? "Paid" : "Unpaid",
        link: `/invoice/${doc.id}`,
      });
    });

    refundsSnap.docs.forEach((doc) => {
      const data = doc.data();
      results.push({
        type: "refund",
        id: doc.id,
        // mapping for common UI
        title: `Refund #${data.refundInvoiceNumber}`,
        subtitle: `Ref: #${data.originalInvoiceNumber}`,
        amount: data.totalAmount,
        date: data.date?._seconds
          ? new Date(data.date._seconds * 1000).toISOString()
          : data.date,
        status: "Refunded",
        link: `/refunds/${doc.id}`,
      });
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search invoices/refunds error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
