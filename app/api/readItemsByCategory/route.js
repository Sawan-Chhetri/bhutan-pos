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

    // 3. Category filter from query param
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    // Allow client to send the timestamp of when they last fetched this category
    const clientTimestamp = searchParams.get("ts");

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }

    // 4. CHECK CACHE VALIDITY (Optimization)
    // If client sent a timestamp, we check if the category has been updated since then.
    if (clientTimestamp) {
      const catQuery = await db
        .collection(`stores/${storeId}/categories`)
        .where("name", "==", category)
        .limit(1)
        .get();

      if (!catQuery.empty) {
        const catData = catQuery.docs[0].data();
        const lastUpdated = catData.lastUpdated?.toMillis() || 0;

        // If server data hasn't changed since client's timestamp, return 304
        // (Note: Next.js API routes don't strictly support 304 via return,
        // so we return specific JSON signal that client handles)
        if (lastUpdated <= Number(clientTimestamp)) {
          return NextResponse.json({ notModified: true });
        }
      }
    }

    const itemsRef = db
      .collection(`stores/${storeId}/items`)
      .where("category", "==", category); // exact match

    // OPTIONAL: Check category timestamp if 'lastFetch' param is provided
    // const lastFetch = searchParams.get("lastFetch");
    // const catRef = db.collection(`stores/${storeId}/categories`).where('name', '==', category).limit(1);
    // ... logic to return 304 if not modified ...

    const itemsSnap = await itemsRef.get();

    const items = itemsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Return items along with current server timestamp for this fetch
    return NextResponse.json({
      items,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("read-items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
