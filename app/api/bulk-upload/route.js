// import { admin } from "@/lib/firebaseAdmin";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     // 1️⃣ Get Authorization header
//     const authHeader = req.headers.get("authorization");

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const idToken = authHeader.replace("Bearer ", "");

//     // 2️⃣ Verify token
//     const decodedToken = await admin.auth().verifyIdToken(idToken);

//     // 3️⃣ Check admin claim
//     if (!decodedToken.admin) {
//       return new NextResponse("Forbidden", { status: 403 });
//     }

//     // 4️⃣ Validate body
//     const { storeId, items } = await req.json();

//     if (!storeId || !Array.isArray(items)) {
//       return new NextResponse("Invalid request", { status: 400 });
//     }

//     // 5️⃣ Bulk upload
//     const batch = admin.firestore().batch();

//     items.forEach((item) => {
//       const { barcode, name, price, category } = item;

//       const ref = admin
//         .firestore()
//         .collection("stores")
//         .doc(storeId)
//         .collection("items")
//         .doc();

//       batch.set(ref, {
//         barcode,
//         name,
//         category,
//         price,
//         isActive: true,
//         isGSTExempt: false,
//         createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       });
//     });

//     await batch.commit();

//     return new NextResponse("Bulk upload successful", { status: 200 });
//   } catch (error) {
//     console.error("Bulk upload error:", error);
//     return new NextResponse("Internal server error", { status: 500 });
//   }
// }

import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    /* ---------------- AUTH ---------------- */
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const idToken = authHeader.replace("Bearer ", "");
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken.admin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    /* ---------------- BODY ---------------- */
    const { storeId, items, categories = [] } = await req.json();

    if (!storeId || !Array.isArray(items)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const db = admin.firestore();
    const storeRef = db.collection("stores").doc(storeId);
    const batch = db.batch();

    /* ---------------- CREATE CATEGORIES ---------------- */
    for (const name of categories) {
      if (!name) continue;

      const categoryId = name.trim().toLowerCase(); // normalize
      const categoryRef = storeRef.collection("categories").doc(categoryId);

      const snap = await categoryRef.get();
      if (!snap.exists) {
        batch.set(categoryRef, {
          name: categoryId,
        });
      }
    }

    /* ---------------- CREATE ITEMS ---------------- */
    let totalRetailDelta = 0;

    items.forEach((item) => {
      const { barcode, name, price, category, stock } = item;
      const numPrice = Number(price || 0);
      const numStock = Number(stock || 0);

      const ref = storeRef.collection("items").doc();

      batch.set(ref, {
        barcode: barcode || null,
        name: name || "Untitled Item",
        category: category || "Uncategorized",
        price: numPrice,
        stock: numStock,
        isActive: true,
        isGSTExempt: false,
      });

      // Update valuation deltas
      totalRetailDelta += numStock * numPrice;
    });

    /* ---------------- UPDATE VALUATION SUMMARY ---------------- */
    const summaryRef = storeRef.collection("inventory_metadata").doc("summary");
    batch.set(
      summaryRef,
      {
        totalRetailValue: admin.firestore.FieldValue.increment(totalRetailDelta),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await batch.commit();

    return new NextResponse(
      JSON.stringify({
        success: true,
        itemsCreated: items.length,
        categoriesCreated: categories.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Bulk upload error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
