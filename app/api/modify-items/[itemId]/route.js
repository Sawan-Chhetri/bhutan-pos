import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const { itemId } = await params;
    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const db = admin.firestore();

    // 🔒 Get storeId from user
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { storeId } = userSnap.data();
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    const itemRef = db.doc(`stores/${storeId}/items/${itemId}`);
    const summaryRef = db.doc(`stores/${storeId}/inventory_metadata/summary`);

    // Use a transaction to ensure atomic updates (Delete Item + Update Category Timestamp + Update Valuation)
    await db.runTransaction(async (tx) => {
      // 1. Reads
      const itemSnap = await tx.get(itemRef);
      if (!itemSnap.exists) {
        throw new Error("ITEM_NOT_FOUND");
      }

      const itemData = itemSnap.data();
      const stock = Number(itemData.stock) || 0;
      const price = Number(itemData.price) || 0;
      const retailValue = stock * price;
      const categoryName = itemData.category;

      const summarySnap = await tx.get(summaryRef);

      // Find Category Doc Reference
      let catDocRef = null;
      if (categoryName) {
        const catQuery = await tx.get(
          db
            .collection(`stores/${storeId}/categories`)
            .where("name", "==", categoryName)
            .limit(1),
        );
        if (!catQuery.empty) {
          catDocRef = catQuery.docs[0].ref;
        }
      }

      // 2. Writes
      tx.delete(itemRef);

      // Decrement Inventory Valuation
      if (summarySnap.exists) {
        tx.update(summaryRef, {
          totalRetailValue: admin.firestore.FieldValue.increment(-retailValue),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Update Category Timestamp (Invalidates Cache)
      if (catDocRef) {
        tx.update(catDocRef, {
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "ITEM_NOT_FOUND") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    console.error("Delete item error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
