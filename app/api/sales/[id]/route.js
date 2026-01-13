export async function PATCH(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const db = admin.firestore();
    // Get user → storeId
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { storeId } = userSnap.data();
    // Find sale
    const { id } = await params;
    const saleRef = db.doc(`stores/${storeId}/sales/${id}`);
    const saleSnap = await saleRef.get();
    if (!saleSnap.exists) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }
    // Get new isPaid value
    const { isPaid } = await request.json();
    await saleRef.update({ isPaid });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // 1️⃣ Get user → storeId
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { storeId } = userSnap.data();

    // 2️⃣ Fetch store details
    const storeSnap = await db.doc(`stores/${storeId}`).get();
    if (!storeSnap.exists) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // 3️⃣ Fetch sale
    const { id } = await params;
    const saleSnap = await db.doc(`stores/${storeId}/sales/${id}`).get();

    if (!saleSnap.exists) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // 4️⃣ Return merged data
    return NextResponse.json({
      id: saleSnap.id,
      ...saleSnap.data(),
      store: {
        id: storeSnap.id,
        ...storeSnap.data(),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
