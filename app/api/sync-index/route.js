import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // 1️⃣ Auth Check
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];

    // Verify token
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
    const uid = decoded.uid;

    const db = admin.firestore();

    // 2️⃣ Get Store ID
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const storeId = userSnap.data()?.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    // 3️⃣ Fetch All Items for Index
    // Optimized: Only select fields needed for search & cart
    // This dramatically reduces bandwidth even for 2000 items
    const itemsSnap = await db
      .collection(`stores/${storeId}/items`)
      .select(
        "name",
        "barcode",
        "price",
        "category",
        "unitType",
        "isGSTExempt",
        "discountPercent",
        "image",
        "stock",
        "minStock",
      )
      .get();

    const items = itemsSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        n: d.name, // Minified keys for smaller payload
        b: d.barcode || "",
        p: d.price || 0,
        c: (d.category || "general").trim(),
        u: d.unitType || "default",
        x: d.isGSTExempt ? 1 : 0, // boolean -> int (smaller)
        d: d.discountPercent || 0,
        s: d.stock || 0,
      };
    });

    return NextResponse.json({
      timestamp: Date.now(),
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Sync Index Error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
