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

    const { item } = await request.json();
    if (!item) {
      return NextResponse.json({ error: "Missing item" }, { status: 400 });
    }

    const db = admin.firestore();

    // 🔒 Derive storeId securely
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { storeId } = userSnap.data();
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    const itemRef = db.collection(`stores/${storeId}/items`).doc();
    const summaryRef = db.doc(`stores/${storeId}/inventory_metadata/summary`);

    const stock = Number(item.stock) || 0;
    const minStock = Number(item.minStock) || 0;
    const price = Number(item.price) || 0;
    const discountPercent = Number(item.discountPercent) || 0;
    const unitType = item.unitType || "default";

    await db.runTransaction(async (tx) => {
      const summarySnap = await tx.get(summaryRef); // Read before write

      tx.set(itemRef, {
        ...item,
        isActive: true,
        stock,
        minStock,
        price,
        discountPercent,
        unitType,
        isLowStock: stock <= minStock,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const retailDelta = stock * price;

      if (!summarySnap.exists) {
        tx.set(summaryRef, {
          totalRetailValue: retailDelta,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        tx.update(summaryRef, {
          totalRetailValue: admin.firestore.FieldValue.increment(retailDelta),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ id: itemRef.id });
  } catch (err) {
    console.error("modify-items POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    // 1. Verify auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const { itemId, updates } = await request.json();

    if (!itemId || !updates) {
      return NextResponse.json(
        { error: "Missing itemId or updates" },
        { status: 400 },
      );
    }

    const db = admin.firestore();

    // 2. Get user's store
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { storeId } = userSnap.data();

    // 3. Item ref (scoped to store)
    const itemRef = db.doc(`stores/${storeId}/items/${itemId}`);
    const itemSnap = await itemRef.get();

    if (!itemSnap.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // 4. Whitelist allowed fields
    const allowedFields = [
      "name",
      "price",
      "discountPercent",
      "category",
      "isGSTExempt",
      "minStock",
      "unitType",
      "barcode",
    ];
    const safeUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const currentData = itemSnap.data();
    const currentStock = Number(currentData.stock || 0);

    // 5. Recalculate isLowStock if minStock is updated
    if (safeUpdates.minStock !== undefined) {
      const newMin = Number(safeUpdates.minStock);
      safeUpdates.isLowStock = currentStock <= newMin;
    }

    safeUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // 6. Transaction to update item and summary
    const summaryRef = db.doc(`stores/${storeId}/inventory_metadata/summary`);

    await db.runTransaction(async (tx) => {
      tx.update(itemRef, safeUpdates);

      let retailDelta = 0;

      if (safeUpdates.price !== undefined) {
        const oldPrice = Number(currentData.price || 0);
        const newPrice = Number(safeUpdates.price);
        retailDelta = (newPrice - oldPrice) * currentStock;
      }

      const updates_summary = {};
      if (retailDelta !== 0) {
        updates_summary.totalRetailValue =
          admin.firestore.FieldValue.increment(retailDelta);
        updates_summary.lastUpdated =
          admin.firestore.FieldValue.serverTimestamp();
        tx.update(summaryRef, updates_summary);
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("modify-items PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
