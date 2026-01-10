import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // -----------------------------
    // 1️⃣ Auth: Verify Firebase ID Token
    // -----------------------------
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // -----------------------------
    // 2️⃣ Get user's storeId
    // -----------------------------
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const storeId = userSnap.data()?.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    // -----------------------------
    // 3️⃣ Fetch all monthly GST reports
    // -----------------------------
    const gstReportsSnap = await db
      .collection(`stores/${storeId}/gstReports`)
      .get();

    const gstReports = gstReportsSnap.docs.map((doc) => ({
      month: doc.id, // document ID is YYYY-MM
      totalSales: doc.data()?.totalSales || 0,
      gstCollected: doc.data()?.gstCollected || 0,
    }));

    // Sort descending by month
    gstReports.sort((a, b) => (a.month > b.month ? -1 : 1));

    return NextResponse.json(gstReports);
  } catch (err) {
    console.error("GST reports fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch GST reports" },
      { status: 500 }
    );
  }
}
