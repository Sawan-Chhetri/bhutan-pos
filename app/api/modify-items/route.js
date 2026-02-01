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

    const stock = Number(item.stock) || 0;
    const minStock = Number(item.minStock) || 0;

    await itemRef.set({
      ...item,
      isActive: true,
      stock, // Ensure number
      minStock, // Ensure number
      isLowStock: stock <= minStock,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: itemRef.id });
  } catch (err) {
    console.error("modify-items POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
        { status: 400 }
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
    const allowedFields = ["name", "price", "category", "isGSTExempt", "minStock"];
    const safeUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // 5. Recalculate isLowStock if minStock is updated
    if (safeUpdates.minStock !== undefined) {
      const currentStock = Number(itemSnap.data().stock || 0);
      const newMin = Number(safeUpdates.minStock);
      safeUpdates.isLowStock = currentStock <= newMin;
    }

    safeUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // 6. Update
    await itemRef.update(safeUpdates);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("modify-items PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
