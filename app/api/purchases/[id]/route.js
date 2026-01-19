import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // 1. Authenticate User
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // 2. Verify Store Access
    const userSnap = await db.doc(`users/${uid}`).get();
    const storeId = userSnap.data()?.storeId;

    if (!storeId) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // 3. Fetch Purchase Document
    const purchaseSnap = await db
      .doc(`stores/${storeId}/purchases/${id}`)
      .get();

    if (!purchaseSnap.exists) {
      return NextResponse.json(
        { error: "Purchase record not found" },
        { status: 404 },
      );
    }

    const data = purchaseSnap.data();

    // 4. Return formatted data
    return NextResponse.json({
      id: purchaseSnap.id,
      ...data,
      date: data.date?.toDate().toISOString() || new Date().toISOString(),
    });
  } catch (err) {
    console.error("Fetch purchase detail failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
