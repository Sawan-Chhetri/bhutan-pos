import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // Get user's store
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { storeId } = userSnap.data();
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    const summarySnap = await db.doc(`stores/${storeId}/inventory_metadata/summary`).get();

    if (!summarySnap.exists) {
      return NextResponse.json({
        totalCostValue: 0,
        totalRetailValue: 0,
        lastUpdated: null
      });
    }

    return NextResponse.json(summarySnap.data());
  } catch (err) {
    console.error("inventory-summary GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
