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
    const itemSnap = await itemRef.get();

    if (!itemSnap.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // 🔥 HARD DELETE (we'll discuss soft delete below)
    await itemRef.delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete item error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
