import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    /* --------------------------------
     * AUTH
     * -------------------------------- */
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    /* --------------------------------
     * GET USER → STORE
     * -------------------------------- */
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { storeId } = userSnap.data();
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    /* --------------------------------
     * PAGINATED QUERY
     * -------------------------------- */
    const itemsCol = db.collection(`stores/${storeId}/items`);
    const baseQuery = itemsCol.where("isLowStock", "==", true);

    // 1. Get Total Count (for pagination UI)
    const countSnap = await baseQuery.get();
    const totalCount = countSnap.size;

    // 2. Pagination Logic
    const offset = (page - 1) * limit;
    
    // Check if we requested a page beyond items
    if (totalCount === 0 || offset >= totalCount) {
         return NextResponse.json({
            items: [],
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit) || 0
        });
    }

    // Optimization: For deep pagination, cursors are better, but offset is okay for internal tools
    let query = baseQuery
        .orderBy("name") // Ensure 'name' is indexed with 'isLowStock' if composite index error occurs
        .limit(limit);

    if (offset > 0) {
        // Simple offset implementation if composite index allows. 
        // Note: isLowStock=true + order by name might require a composite index. 
        // If "name" is not available/consistent, ordering by document ID is safer.
        // Let's assume 'name' exists. If not, error might pop up to create index.
        const prevSnap = await baseQuery.orderBy("name").limit(offset).get();
        const lastDoc = prevSnap.docs[prevSnap.docs.length - 1];
        if (lastDoc) {
             query = query.startAfter(lastDoc);
        }
    }

    const itemsSnap = await query.get();

    const lowStockItems = itemsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      items: lowStockItems,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error("read-low-stock-items error:", error);
    // Fallback: If index is missing, return friendly error or try non-ordered query
    if (error.code === 5 || error.message?.includes("index")) {
        return NextResponse.json(
            { error: "Missing Firestore Index. Please create composite index for 'isLowStock' + 'name'." },
            { status: 500 }
        );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
