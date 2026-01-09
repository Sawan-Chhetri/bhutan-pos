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

    const { categoryId } = await params;
    if (!categoryId) {
      return NextResponse.json(
        { error: "Missing categoryId" },
        { status: 400 }
      );
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

    const categoryRef = db.doc(`stores/${storeId}/categories/${categoryId}`);
    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // 🔥 HARD DELETE (we'll discuss soft delete below)
    await categoryRef.delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete category error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
