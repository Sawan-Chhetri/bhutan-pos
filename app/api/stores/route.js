import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const db = admin.firestore();

    // 🔒 Derive storeId securely
    const storesSnap = await db.collection(`stores`).get();
    if (storesSnap.empty) {
      return NextResponse.json({ error: "No stores found" }, { status: 404 });
    }
    const stores = [];
    storesSnap.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json({ stores });
  } catch (err) {
    console.error("stores GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
