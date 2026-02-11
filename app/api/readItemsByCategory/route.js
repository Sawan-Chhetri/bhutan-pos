import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // 1. Verify token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // 2. Get user → storeId
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { storeId } = userSnap.data();
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    // 3. Category & Pagination params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    const clientTimestamp = searchParams.get("ts");

    // Pagination
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const startAfterName = searchParams.get("startAfterName");
    const startAfterId = searchParams.get("startAfterId");

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }

    // 4. CHECK CACHE VALIDITY
    // Only check timestamp for the initial page load (no cursor)
    if (clientTimestamp && !startAfterName) {
      const catQuery = await db
        .collection(`stores/${storeId}/categories`)
        .where("name", "==", category)
        .limit(1)
        .get();

      if (!catQuery.empty) {
        const catData = catQuery.docs[0].data();
        const lastUpdated = catData.lastUpdated?.toMillis() || 0;

        // If server data hasn't changed since client's timestamp, return 304 signal
        if (lastUpdated <= Number(clientTimestamp)) {
          return NextResponse.json({ notModified: true });
        }
      }
    }

    // 5. Query Items with Pagination
    // Note: This requires a purely composite index if sorting by name.
    // Ensure you have an index for collection 'items': [category (ASC), name (ASC), __name__ (ASC)]
    let itemsRef = db
      .collection(`stores/${storeId}/items`)
      .where("category", "==", category)
      .orderBy("name", "asc")
      .orderBy("__name__", "asc"); // Stable sort

    if (startAfterName && startAfterId) {
      itemsRef = itemsRef.startAfter(startAfterName, startAfterId);
    }

    const itemsSnap = await itemsRef.limit(limit).get();

    const items = itemsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate next cursor
    let nextCursor = null;
    if (items.length === limit) {
      const lastItem = items[items.length - 1];
      nextCursor = {
        name: lastItem.name,
        id: lastItem.id,
      };
    }

    // Return items along with current server timestamp for this fetch
    return NextResponse.json({
      items,
      timestamp: Date.now(),
      nextCursor,
      hasMore: !!nextCursor,
    });
  } catch (error) {
    console.error("read-items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
