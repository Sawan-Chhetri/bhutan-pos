import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // -------------------------------
    // 1️⃣ Authenticate the user
    // -------------------------------
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // -------------------------------
    // 2️⃣ Get storeId from user
    // -------------------------------
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const storeId = userSnap.data()?.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    // -------------------------------
    // 3️⃣ Get month param
    // -------------------------------
    const { month } = await params; // e.g., "2026-01"
    if (!month) {
      return NextResponse.json({ error: "Month is required" }, { status: 400 });
    }

    // -------------------------------
    // 4️⃣ Fetch GST report for this month
    // -------------------------------
    const gstReportRef = db.doc(`stores/${storeId}/gstReports/${month}`);
    const gstSnap = await gstReportRef.get();

    if (!gstSnap.exists) {
      return NextResponse.json(
        { error: "No GST report found for this month" },
        { status: 404 },
      );
    }
    const gstData = gstSnap.data();

    // -------------------------------
    // 5️⃣ Fetch store/business info
    // -------------------------------
    const storeSnap = await db.doc(`stores/${storeId}`).get();
    const storeData = storeSnap.exists
      ? storeSnap.data()
      : { name: "Unknown Store", address: "", phone: "" };

    // -------------------------------
    // 6️⃣ Return formatted response
    // -------------------------------
    return NextResponse.json({
      month,
      totalSales: gstData.totalSales || 0,
      totalOrders: gstData.saleCount || 0,
      taxableSales: gstData.taxableSales || 0,
      gstCollected: gstData.gstCollected || 0,
      taxablePurchases: gstData.taxablePurchases || 0,
      itcClaimed: gstData.itcClaimed || 0,
      purchaseCount: gstData.purchaseCount || 0,
      business: {
        name: storeData.name || "",
        phone: storeData.phone || "",
      },
    });
  } catch (err) {
    console.error("GST report fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
