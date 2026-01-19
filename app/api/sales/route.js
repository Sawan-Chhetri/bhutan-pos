import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// 🔢 GST rate (change in ONE place if needed)
const GST_RATE = 0.05;

export async function POST(request) {
  try {
    /* =====================================================

     * ===================================================== */
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const debugToken = authHeader.split("Bearer ")[1];
    }

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    /* =====================================================
     * 2️⃣ REQUEST BODY VALIDATION
     * ===================================================== */
    const {
      cartItems,
      subtotal,
      gst,
      total,
      customerName,
      customerCID,
      contact,
      customerId,
      customerAddress,
      isPaid,
    } = await request.json();

    if (!cartItems?.length) {
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    }

    if ((total > 50000 && !customerCID) || !customerName) {
      return NextResponse.json(
        {
          error:
            "Customer CID/Passport Number is required for this transaction.",
        },
        { status: 400 },
      );
    }

    const db = admin.firestore();

    /* =====================================================
     * 3️⃣ FETCH STORE ID (USER → STORE LINK)
     * ===================================================== */
    const userSnap = await db.doc(`users/${uid}`).get();
    const storeId = userSnap.data()?.storeId;

    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    /* =====================================================
     * 4️⃣ DATE HELPERS (FOR GST MONTH)
     * ===================================================== */
    const now = admin.firestore.Timestamp.now();
    const dateObj = now.toDate();

    // Format: YYYY-MM → 2026-01
    const monthKey = `${dateObj.getFullYear()}-${String(
      dateObj.getMonth() + 1,
    ).padStart(2, "0")}`;

    /* =====================================================
     * 5️⃣ FIRESTORE REFERENCES
     * ===================================================== */
    const counterRef = db.doc(`stores/${storeId}/invoiceCounter/current`);
    const salesRef = db.collection(`stores/${storeId}/sales`);
    const gstReportRef = db.doc(`stores/${storeId}/gstReports/${monthKey}`);

    let invoiceNumber;
    let saleId;

    /* =====================================================
     * 6️⃣ TRANSACTION (CRITICAL SECTION)
     * ===================================================== */
    await db.runTransaction(async (tx) => {
      /* ---------------------------------------------
       * A) READ EVERYTHING FIRST (MANDATORY)
       * --------------------------------------------- */
      const counterSnap = await tx.get(counterRef);
      const gstSnap = await tx.get(gstReportRef);

      /* ---------------------------------------------
       * B) GENERATE INVOICE NUMBER (IN-MEMORY)
       * --------------------------------------------- */
      if (!counterSnap.exists) {
        invoiceNumber = 1;
      } else {
        invoiceNumber = counterSnap.data().current + 1;
      }

      /* ---------------------------------------------
       * C) PREPARE SALE ITEMS + GST CALCULATION
       * --------------------------------------------- */
      let taxableSales = 0;
      let gstCollected = 0;

      const items = cartItems.map((item) => {
        const lineTotal = item.qty * item.unitPrice;

        if (!item.isGSTExempt) {
          taxableSales += lineTotal;
          gstCollected += lineTotal * GST_RATE;
        }

        // return {
        //   itemId: item.id,
        //   name: item.name,
        //   unitPrice: item.unitPrice,
        //   qty: item.qty,
        //   lineTotal,
        //   isGSTExempt: item.isGSTExempt ?? false,
        // };
        return {
          itemId: item.id,
          name: item.name || item.description, // fallback
          unitPrice: Number(item.unitPrice ?? item.rate ?? 0),
          qty: Number(item.qty || 0),
          lineTotal,
          isGSTExempt: item.isGSTExempt ?? false,
          customerName: customerName || null,
          customerCID: customerCID || null,
          cusAddress: customerAddress || null,
          cusId: customerId || null,
          isPaid: isPaid ?? true,
        };
      });

      const saleDocRef = salesRef.doc();
      saleId = saleDocRef.id;
      /* ---------------------------------------------
       * D) WRITE EVERYTHING (AFTER ALL READS)
       * --------------------------------------------- */

      // Update invoice counter
      if (!counterSnap.exists) {
        tx.set(counterRef, { current: invoiceNumber });
      } else {
        tx.update(counterRef, { current: invoiceNumber });
      }

      // Create sale
      tx.set(saleDocRef, {
        invoiceNumber,
        items,
        subtotal,
        gst: gstCollected,
        total,
        taxableSales,
        customerName: customerName || null,
        customerCID: customerCID || null,
        contact: contact || customerAddress,
        date: now,
        createdBy: uid,
        isPaid: isPaid ?? true,
      });

      // Update GST monthly report
      if (!gstSnap.exists) {
        tx.set(gstReportRef, {
          month: monthKey,
          totalSales: total,
          taxableSales,
          gstCollected,
          saleCount: 1,
          lastUpdated: now,
        });
      } else {
        tx.update(gstReportRef, {
          totalSales: admin.firestore.FieldValue.increment(total),
          taxableSales: admin.firestore.FieldValue.increment(taxableSales),
          gstCollected: admin.firestore.FieldValue.increment(gstCollected),
          saleCount: admin.firestore.FieldValue.increment(1),
          lastUpdated: now,
        });
      }
    });

    /* =====================================================
     * 7️⃣ SUCCESS RESPONSE
     * ===================================================== */
    return NextResponse.json({
      saleId,
      success: true,
      invoiceNumber,
    });
  } catch (err) {
    console.error("Invoice transaction failed:", err);

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}

// export async function POST(request) {
//   try {
//     // 🔐 Auth
//     const authHeader = request.headers.get("authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const idToken = authHeader.split("Bearer ")[1];
//     const decoded = await admin.auth().verifyIdToken(idToken);
//     const uid = decoded.uid;

//     const { cartItems, subtotal, gst, total, customerName, contact } =
//       await request.json();

//     if (!cartItems?.length) {
//       return NextResponse.json({ error: "Empty cart" }, { status: 400 });
//     }

//     const db = admin.firestore();

//     // 🔒 Get storeId
//     const userSnap = await db.doc(`users/${uid}`).get();
//     const storeId = userSnap.data()?.storeId;

//     if (!storeId) {
//       return NextResponse.json({ error: "Store not linked" }, { status: 400 });
//     }

//     const counterRef = db.doc(`stores/${storeId}/invoiceCounter/current`);
//     const salesRef = db.collection(`stores/${storeId}/sales`);

//     let invoiceNumber;

//     await db.runTransaction(async (tx) => {
//       const counterSnap = await tx.get(counterRef);

//       if (!counterSnap.exists) {
//         invoiceNumber = 1;
//         tx.set(counterRef, { current: invoiceNumber });
//       } else {
//         invoiceNumber = counterSnap.data().current + 1;
//         tx.update(counterRef, { current: invoiceNumber });
//       }

//       const saleDocRef = salesRef.doc();

//       const items = cartItems.map((item) => ({
//         itemId: item.id,
//         name: item.name,
//         unitPrice: item.unitPrice,
//         qty: item.qty,
//         lineTotal: item.qty * item.unitPrice,
//         isGSTExempt: item.isGSTExempt ?? false,
//       }));

//       tx.set(saleDocRef, {
//         invoiceNumber,
//         items,
//         subtotal,
//         gst,
//         total,
//         customerName: customerName || null,
//         contact: contact || null,
//         date: admin.firestore.FieldValue.serverTimestamp(),
//         createdBy: uid,
//       });
//     });

//     return NextResponse.json({
//       success: true,
//       invoiceNumber,
//     });
//   } catch (err) {
//     console.error("Invoice transaction failed:", err);
//     return NextResponse.json(
//       { error: "Failed to create invoice" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // Get user → storeId
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { storeId } = userSnap.data();
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    // Fetch total count for pagination
    const totalSnap = await db.collection(`stores/${storeId}/sales`).get();
    const totalCount = totalSnap.size;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch paginated data (Firestore does not support offset efficiently for large datasets,
    // better is to use cursors, but for small datasets offset is fine)
    let salesRef = db
      .collection(`stores/${storeId}/sales`)
      .orderBy("date", "desc") // order by date
      .limit(limit);

    if (offset > 0) {
      const prevSnap = await db
        .collection(`stores/${storeId}/sales`)
        .orderBy("date", "desc")
        .limit(offset)
        .get();

      const lastDoc = prevSnap.docs[prevSnap.docs.length - 1];
      if (lastDoc) salesRef = salesRef.startAfter(lastDoc);
    }

    const salesSnap = await salesRef.get();

    const sales = salesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ sales, totalCount });
  } catch (error) {
    console.error("sales error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
