// import { admin } from "@/lib/firebaseAdmin";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     // 1. Verify token
//     const authHeader = request.headers.get("authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const idToken = authHeader.split("Bearer ")[1];
//     const decoded = await admin.auth().verifyIdToken(idToken);
//     const uid = decoded.uid;

//     const db = admin.firestore();

//     // 2. Get user → storeId
//     const userSnap = await db.doc(`users/${uid}`).get();
//     if (!userSnap.exists) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const { storeId } = userSnap.data();
//     if (!storeId) {
//       return NextResponse.json({ error: "Store not linked" }, { status: 400 });
//     }

//     // 3. Fetch items for THIS store only
//     const itemsSnap = await db.collection(`stores/${storeId}/items`).get();

//     const items = itemsSnap.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     return NextResponse.json(items);
//   } catch (error) {
//     console.error("read-items error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

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

    const itemsCol = db.collection(`stores/${storeId}/items`);

    /* --------------------------------
     * TOTAL COUNT (Optimized with .count())
     * -------------------------------- */
    const totalCountSnap = await itemsCol.count().get();
    const totalCount = totalCountSnap.data().count;

    /* --------------------------------
     * PAGINATION
     * -------------------------------- */
    const offset = (page - 1) * limit;

    let itemsQuery = itemsCol
      .orderBy("name") // stable ordering for pagination
      .limit(limit);

    if (offset > 0) {
      const prevSnap = await itemsCol.orderBy("name").limit(offset).get();

      const lastDoc = prevSnap.docs[prevSnap.docs.length - 1];
      if (lastDoc) {
        itemsQuery = itemsQuery.startAfter(lastDoc);
      }
    }

    const itemsSnap = await itemsQuery.get();

    const items = itemsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      items,
      totalCount,
    });
  } catch (error) {
    console.error("read-items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
