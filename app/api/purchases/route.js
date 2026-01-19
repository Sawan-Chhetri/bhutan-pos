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
      items,
      itc,
      totalPurchases,
      supplierName,
      supplierTIN,
      billNumber,
    } = await request.json();

    if (!items?.length) {
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
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
    const purchaseRef = db.collection(`stores/${storeId}/purchases`);
    const gstReportRef = db.doc(`stores/${storeId}/gstReports/${monthKey}`);

    let purchaseId;

    /* =====================================================
     * 6️⃣ TRANSACTION (CRITICAL SECTION)
     * ===================================================== */
    await db.runTransaction(async (tx) => {
      /* ---------------------------------------------
       * A) READ EVERYTHING FIRST (MANDATORY)
       * --------------------------------------------- */
      const gstSnap = await tx.get(gstReportRef);

      /* ---------------------------------------------
       * B) PREPARE PURCHASE ITEMS + GST CALCULATION
       * --------------------------------------------- */
      let taxablePurchases = 0;
      let totalITC = 0;

      const cartItems = items.map((item) => {
        const lineTotal = item.qty * item.cost;

        if (item.isTaxable) {
          taxablePurchases += lineTotal;
          totalITC += lineTotal * GST_RATE;
        }

        return {
          itemId: item.id,
          name: item.description, // fallback
          cost: Number(item.cost ?? 0),
          qty: Number(item.qty || 0),
          lineTotal,
          isTaxable: item.isTaxable ?? false,
        };
      });

      const purchaseDocRef = purchaseRef.doc();
      purchaseId = purchaseDocRef.id;
      /* ---------------------------------------------
       * D) WRITE EVERYTHING (AFTER ALL READS)
       * --------------------------------------------- */

      // Create purchase document
      tx.set(purchaseDocRef, {
        billNumber,
        cartItems,
        itc: totalITC,
        totalPurchases,
        supplierName: supplierName || null,
        supplierTIN: supplierTIN || null,
        date: now,
        createdBy: uid,
      });

      // Update GST monthly report
      if (!gstSnap.exists) {
        tx.set(gstReportRef, {
          month: monthKey,
          totalPurchases: taxablePurchases,
          itcClaimed: totalITC,
          purchaseCount: 1,
          lastUpdated: now,
        });
      } else {
        tx.update(gstReportRef, {
          taxablePurchases:
            admin.firestore.FieldValue.increment(taxablePurchases),
          itcClaimed: admin.firestore.FieldValue.increment(totalITC),
          purchaseCount: admin.firestore.FieldValue.increment(1),
          lastUpdated: now,
        });
      }
    });

    /* =====================================================
     * 7️⃣ SUCCESS RESPONSE
     * ===================================================== */
    return NextResponse.json({
      purchaseId,
      success: true,
    });
  } catch (err) {
    console.error("Purchase transaction failed:", err);

    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    /* 1. AUTHENTICATION */
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    /* 2. GET STORE ID */
    const userSnap = await db.doc(`users/${uid}`).get();
    const storeId = userSnap.data()?.storeId;

    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    /* 3. PARSE QUERY PARAMETERS */
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const lastDocId = searchParams.get("lastDocId"); // For pagination
    const search = searchParams.get("search")?.toUpperCase(); // Search term

    /* 4. BUILD QUERY */
    let query = db
      .collection(`stores/${storeId}/purchases`)
      .orderBy("date", "desc")
      .limit(limit);

    // Filter by Bill Number or Supplier Name if search exists
    // Note: Firestore prefix search requires .where() logic
    if (search) {
      // This works for Bill Numbers starting with the search string
      query = query
        .where("billNumber", ">=", search)
        .where("billNumber", "<=", search + "\uf8ff");
    }

    // Pagination Cursor
    if (lastDocId) {
      const lastDocSnap = await db
        .collection(`stores/${storeId}/purchases`)
        .doc(lastDocId)
        .get();
      if (lastDocSnap.exists) {
        query = query.startAfter(lastDocSnap);
      }
    }

    /* 5. EXECUTE FETCH */
    const snapshot = await query.get();

    const purchases = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string for the frontend
        date: data.date?.toDate().toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      purchases,
      lastDocId: snapshot.docs[snapshot.docs.length - 1]?.id || null,
      hasMore: snapshot.docs.length === limit,
    });
  } catch (err) {
    console.error("Fetch purchases failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 },
    );
  }
}
