// import { admin } from "@/lib/firebaseAdmin";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     const authHeader = request.headers.get("authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const idToken = authHeader.split("Bearer ")[1];
//     const decoded = await admin.auth().verifyIdToken(idToken);
//     const uid = decoded.uid;

//     const db = admin.firestore();
//     const userSnap = await db.doc(`users/${uid}`).get();
//     const storeId = userSnap.data()?.storeId;

//     if (!storeId)
//       return NextResponse.json({ error: "Store not linked" }, { status: 400 });

//     // Fetch last 100 refunds (Credit Notes)
//     const refundsSnap = await db
//       .collection(`stores/${storeId}/refunds`)
//       .orderBy("date", "desc")
//       .limit(100)
//       .get();

//     const refunds = refundsSnap.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       date: doc.data().date?.toDate().toISOString(),
//     }));

//     // Calculate quick stats for the UI header
//     const stats = refunds.reduce(
//       (acc, curr) => {
//         acc.totalReversed += curr.totalAmount || 0;
//         acc.gstReclaimed += curr.gstAmount || 0;
//         return acc;
//       },
//       { totalReversed: 0, gstReclaimed: 0 },
//     );

//     return NextResponse.json({ refunds, stats });
//   } catch (err) {
//     console.error("Refund fetch error:", err);
//     return NextResponse.json(
//       { error: "Failed to load audit logs" },
//       { status: 500 },
//     );
//   }
// }

import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();
    const userSnap = await db.doc(`users/${uid}`).get();
    const storeId = userSnap.data()?.storeId;

    if (!storeId)
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });

    const refundsCol = db.collection(`stores/${storeId}/refunds`);

    // Get total count for pagination math
    const totalSnap = await refundsCol.count().get();
    const totalCount = totalSnap.data().count;

    // Fetch paginated data
    const refundsSnap = await refundsCol
      .orderBy("date", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const refunds = refundsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate().toISOString(),
    }));

    // Calculate stats (Note: For large datasets, stats should be pre-computed in a metadata doc)
    // For now, we fetch a brief summary or use a fixed historical set
    const statsSnap = await db
      .doc(`stores/${storeId}/metadata/refundStats`)
      .get();
    const stats = statsSnap.exists
      ? statsSnap.data()
      : { totalReversed: 0, gstReclaimed: 0 };

    return NextResponse.json({ refunds, totalCount, stats });
  } catch (err) {
    console.error("Refund fetch error:", err);
    return NextResponse.json(
      { error: "Failed to load audit logs" },
      { status: 500 },
    );
  }
}
