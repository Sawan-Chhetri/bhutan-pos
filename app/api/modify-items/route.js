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

    await db.collection(`stores/${storeId}/items`).add({
      ...item,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
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
    const allowedFields = ["name", "price", "categoryId", "isGSTExempt"];
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

    safeUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // 5. Update
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
