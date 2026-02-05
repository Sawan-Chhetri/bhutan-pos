import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

const GST_RATE = 0.05;

export async function POST(request, { params }) {
  try {
    const { id: saleId } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const { cartItems, reason } = await request.json();

    if (!cartItems?.length) {
      return NextResponse.json(
        { error: "No items to refund" },
        { status: 400 },
      );
    }

    const db = admin.firestore();
    const userSnap = await db.doc(`users/${uid}`).get();
    const userData = userSnap.data();
    const storeId = userData?.storeId;
    const userType = userData?.type; // e.g., "pos", "restaurants"

    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    const saleRef = db.doc(`stores/${storeId}/sales/${saleId}`);
    const refundRef = db.collection(`stores/${storeId}/refunds`).doc();
    const counterRef = db.doc(`stores/${storeId}/refundCounter/current`);
    const summaryRef = db.doc(`stores/${storeId}/inventory_metadata/summary`);

    const now = admin.firestore.Timestamp.now();
    const dateObj = now.toDate();
    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
    const gstReportRef = db.doc(`stores/${storeId}/gstReports/${monthKey}`);

    let refundInvoiceNumber;

    await db.runTransaction(async (tx) => {
      const saleSnap = await tx.get(saleRef);
      const counterSnap = await tx.get(counterRef);
      const summarySnap = await tx.get(summaryRef);

      if (!saleSnap.exists) throw new Error("Original sale record not found");
      const saleData = saleSnap.data();

      // Check for duplicate refund attempts
      if (saleData.refundStatus === "fully-refunded")
        throw new Error("Invoice already fully refunded");

      // B) Credit Note Numbering
      refundInvoiceNumber = !counterSnap.exists
        ? 1
        : (counterSnap.data().current || 0) + 1;

      // C) Math Prep
      const originalNetSubtotal = saleData.subtotal || 1;
      const originalFinalBeforeTax = saleData.finalBeforeTax || 1;
      const discountRatio = originalFinalBeforeTax / originalNetSubtotal;

      let refundTaxableAmount = 0;
      let refundGstAmount = 0;
      let refundSubtotal = 0;
      let retailValuationIncrease = 0;

      // D) Process Items & Build the reversal
      const updatedSaleItems = saleData.items.map((saleItem) => {
        const refundItem = cartItems.find((r) => r.itemId === saleItem.itemId);

        if (refundItem) {
          const alreadyRefunded = saleItem.refundedQty || 0;
          const totalAfterThis = alreadyRefunded + refundItem.qty;

          if (totalAfterThis > saleItem.qty) {
            throw new Error(
              `Item ${saleItem.name} exceeds available refund quantity.`,
            );
          }

          const lineTotal =
            refundItem.qty *
            (saleItem.effectiveUnitPrice || saleItem.unitPrice);
          refundSubtotal += lineTotal;

          if (!saleItem.isGSTExempt) {
            refundTaxableAmount += lineTotal * discountRatio;
            refundGstAmount += lineTotal * discountRatio * GST_RATE;
          }

          // 📦 STOCK INCREMENT LOGIC (Only for POS users)
          if (userType === "pos" && saleItem.itemId) {
            const itemRef = db.doc(
              `stores/${storeId}/items/${saleItem.itemId}`,
            );
            tx.update(itemRef, {
              stock: admin.firestore.FieldValue.increment(refundItem.qty),
            });
            retailValuationIncrease +=
              refundItem.qty * Number(saleItem.unitPrice || 0);
          }

          return { ...saleItem, refundedQty: totalAfterThis };
        }
        return saleItem;
      });

      const refundGrandTotal = refundSubtotal * discountRatio + refundGstAmount;

      // Determine Final Invoice Status
      const totalSold = updatedSaleItems.reduce((sum, i) => sum + i.qty, 0);
      const totalRefunded = updatedSaleItems.reduce(
        (sum, i) => sum + (i.refundedQty || 0),
        0,
      );
      const newStatus =
        totalRefunded >= totalSold ? "fully-refunded" : "partially-refunded";

      // ---------------------------------------------
      // ATOMIC WRITES
      // ---------------------------------------------

      // 1. Create Credit Note
      tx.set(refundRef, {
        refundInvoiceNumber: `CN-${refundInvoiceNumber}`,
        originalSaleId: saleId,
        originalInvoiceNumber: saleData.invoiceNumber,
        items: cartItems,
        subtotal: refundSubtotal * discountRatio,
        gstAmount: refundGstAmount,
        totalAmount: refundGrandTotal,
        reason: reason || "Customer Return",
        date: now,
        createdBy: uid,
      });

      // 2. Update Original Sale
      tx.update(saleRef, {
        items: updatedSaleItems,
        refundIds: admin.firestore.FieldValue.arrayUnion(refundRef.id),
        refundStatus: newStatus,
        totalRefundedQty: totalRefunded,
        updatedAt: now,
      });

      // 3. Update GST Report
      tx.set(
        gstReportRef,
        {
          gstRefunded: admin.firestore.FieldValue.increment(refundGstAmount),
          refundCount: admin.firestore.FieldValue.increment(1),
          lastUpdated: now,
        },
        { merge: true },
      );

      // 4. Update Inventory Summary (POS only)
      if (userType === "pos" && summarySnap.exists) {
        tx.update(summaryRef, {
          totalRetailValue: admin.firestore.FieldValue.increment(
            retailValuationIncrease,
          ),
          lastUpdated: now,
        });
      }

      // 5. Update Counter
      tx.set(counterRef, { current: refundInvoiceNumber }, { merge: true });
    });

    return NextResponse.json({
      success: true,
      refundInvoiceNumber: `CN-${refundInvoiceNumber}`,
    });
  } catch (err) {
    console.error("Refund transaction failed:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
