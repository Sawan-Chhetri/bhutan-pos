import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const body = await request.json();
    const {
      items = [],
      subtotal = 0,
      gst = 0,
      total = 0,
      companyName = null,
      projectName = null,
      companyAddress = null,
      gstNumber = null,
      notes = null,
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Empty invoice" }, { status: 400 });
    }

    const db = admin.firestore();

    // Get storeId from user
    const userSnap = await db.doc(`users/${uid}`).get();
    const storeId = userSnap.data()?.storeId;

    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    // Use month key for reports if needed
    const now = admin.firestore.Timestamp.now();
    const dateObj = now.toDate();
    const monthKey = `${dateObj.getFullYear()}-${String(
      dateObj.getMonth() + 1
    ).padStart(2, "0")}`;

    const counterRef = db.doc(`stores/${storeId}/invoiceCounter/current`);
    const invoicesRef = db.collection(`stores/${storeId}/invoices`);

    let invoiceNumber;
    let invoiceId;

    await db.runTransaction(async (tx) => {
      const counterSnap = await tx.get(counterRef);

      if (!counterSnap.exists) {
        invoiceNumber = 1;
      } else {
        invoiceNumber = counterSnap.data().current + 1;
      }

      // calculate taxable sales & gst collected (respect per-item exemption)
      let taxable = 0;
      let gstCollected = 0;

      const normalizedItems = items.map((it) => {
        const qty = Number(it.qty || 0);
        const rate = Number(it.rate || 0);
        const lineTotal = qty * rate;
        const exempt = !!it.isGSTExempt;
        const gstPercent = Number(it.gstPercent || 0);

        if (!exempt) {
          taxable += lineTotal;
          gstCollected += lineTotal * (gstPercent / 100);
        }

        return {
          description: it.description || null,
          qty,
          rate,
          gstPercent,
          isGSTExempt: exempt,
          lineTotal,
        };
      });

      // update counter
      if (!counterSnap.exists) {
        tx.set(counterRef, { current: invoiceNumber });
      } else {
        tx.update(counterRef, { current: invoiceNumber });
      }

      const docRef = invoicesRef.doc();
      invoiceId = docRef.id;

      tx.set(docRef, {
        invoiceNumber,
        items: normalizedItems,
        subtotal,
        gst: gstCollected,
        total,
        companyName: companyName || null,
        projectName: projectName || null,
        companyAddress: companyAddress || null,
        gstNumber: gstNumber || null,
        notes: notes || null,
        date: now,
        createdBy: uid,
      });

      // (optional) update monthly reports document — left minimal for now
    });

    return NextResponse.json({ success: true, invoiceNumber, id: invoiceId });
  } catch (err) {
    console.error("Invoice create failed:", err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
