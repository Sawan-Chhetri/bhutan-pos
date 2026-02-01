import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1️⃣ Get storeId and query from URL
    const storeId = searchParams.get("storeId");
    const queryName = searchParams.get("query").toLowerCase(); // exact name
    const end = queryName + "\uf8ff";

    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
    }
    if (!queryName) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 }
      );
    }

    const db = admin.firestore();

    // 2️⃣ Query Firestore
    // A) Search by Name (Partial)
    const nameQueryPromise = db
      .collection(`stores/${storeId}/items`)
      .where("name", ">=", queryName)
      .where("name", "<=", end)
      .get();

    // B) Search by Barcode (Exact) - use original query case
    const rawQuery = searchParams.get("query").trim();
    const barcodeQueryPromise = db
      .collection(`stores/${storeId}/items`)
      .where("barcode", "==", rawQuery)
      .get();

    const [nameSnap, barcodeSnap] = await Promise.all([
      nameQueryPromise,
      barcodeQueryPromise,
    ]);

    const results = new Map();

    // Helper to add docs
    const addDocs = (snap) => {
      snap.forEach((doc) => {
        if (!results.has(doc.id)) {
          results.set(doc.id, { id: doc.id, ...doc.data() });
        }
      });
    };

    addDocs(nameSnap);
    addDocs(barcodeSnap);

    const items = Array.from(results.values());

    return NextResponse.json(items);
  } catch (error) {
    console.error("search-items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
