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

    // 3️⃣ Fetch Items (Full vs Delta)
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get("since");
    const sinceTimestamp = sinceParam ? parseInt(sinceParam) : 0;
    
    let query = db.collection(`stores/${storeId}/items`);

    // MODE A: Delta Sync (Only changed items)
    if (sinceTimestamp > 0) {
       const sinceDate = admin.firestore.Timestamp.fromMillis(sinceTimestamp);
       query = query.where("updatedAt", ">", sinceDate);
    } 
    // MODE B: Full Sync (Only Active Items)
    else {
       // CRITICAL FIX: Do NOT use .where("isDeleted", "!=", true) because
       // Firestore excludes documents where the field "isDeleted" does not exist.
       // Legacy items (created before today) do not have this field, so they vanish.
       // Use client-side filtering (or map-side filtering) instead.
       // query = query; // Fetch all
    }

    // Select fields + essential metadata for sync
    const itemsSnap = await query
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
        "isDeleted", // New: Needed for delta sync
        "updatedAt"  // New: Needed for next cursor
      )
      .get();

    const items = itemsSnap.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          n: d.name, 
          b: d.barcode || "",
          p: d.price || 0,
          c: (d.category || "general").trim(),
          u: d.unitType || "default",
          x: d.isGSTExempt ? 1 : 0, 
          d: d.discountPercent || 0,
          s: d.stock || 0,
          del: d.isDeleted ? 1 : 0 // Boolean -> Int
        };
      })
      // If Full Sync, we filter out deleted items here to save bandwidth/client processing
      // Legacy items (d.isDeleted undefined) will have del=0, so kept.
      // Explicitly deleted items (d.isDeleted=true) will have del=1, so filtered out.
      .filter(item => sinceTimestamp > 0 || item.del === 0);

    return NextResponse.json({
      timestamp: Date.now(),
      count: items.length,
      mode: sinceTimestamp > 0 ? 'delta' : 'full',
      items,
    });
  } catch (error) {
    console.error("Sync Index Error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
