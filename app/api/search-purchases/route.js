import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query"); // e.g., Bill No or Supplier Name
    const storeId = searchParams.get("storeId");

    if (!query || !storeId) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    const db = admin.firestore();
    const purchasesRef = db.collection(`stores/${storeId}/purchases`);

    // We want to support searching by:
    // 1. Bill Number (exact or partial?) - Firestore only supports prefix match or exact match on indexed fields
    // 2. Supplier Name

    // Firestore OR queries are limited. We'll run parallel queries.
    // NOTE: 'billNumber' and 'supplierName' are string fields in your DB.

    const lowerQuery = query.toLowerCase();

    // 1. Search by Bill Number (Exact Match)
    const billPromise = purchasesRef
      .where("billNumber", "==", query)
      .limit(5)
      .get();

    // 2. Search by Supplier Name (Prefix Match) -- Case sensitive usually, unless you store lowercase
    // Assuming simple exact or prefix match for now. Improving search usually requires a dedicated search service (Algolia/Typesense)
    // or storing a 'keywords' array.
    // For now: exact match on supplierName or simple query
    const supplierPromise = purchasesRef
      .where("supplierName", ">=", lowerQuery)
      .where("supplierName", "<=", lowerQuery + "\uf8ff")
      .limit(5)
      .get();

    const [billSnap, supplierSnap] = await Promise.all([
      billPromise,
      supplierPromise,
    ]);

    const results = new Map(); // Use Map to deduplicate by ID

    const addDocs = (snap) => {
      snap.forEach((doc) => {
        const data = doc.data();
        results.set(doc.id, {
          id: doc.id,
          title: data.supplierName,
          subtitle: `Bill: ${data.billNumber}`,
          amount: (data.grossPurchases || 0) + (data.totalGST || 0), // Gross Total
          date: data.date?._seconds
            ? new Date(data.date._seconds * 1000).toISOString()
            : data.date,
          link: `/purchase-history/${doc.id}`,
        });
      });
    };

    addDocs(billSnap);
    addDocs(supplierSnap);

    return NextResponse.json(Array.from(results.values()));
  } catch (error) {
    console.error("Search purchases error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
