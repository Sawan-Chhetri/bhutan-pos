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

    // 2️⃣ Query Firestore for exact name match
    const itemsRef = db
      .collection(`stores/${storeId}/items`)
      .where("name", ">=", queryName)
      .where("name", "<=", end);

    const itemsSnap = await itemsRef.get();

    if (itemsSnap.empty) {
      return NextResponse.json([]);
    }

    const items = itemsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("search-items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
