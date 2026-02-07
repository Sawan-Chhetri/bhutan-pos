import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id: refundId } = await params;
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

    const refundSnap = await db
      .doc(`stores/${storeId}/refunds/${refundId}`)
      .get();
    if (!refundSnap.exists) {
      return NextResponse.json(
        { error: "Credit Note not found" },
        { status: 404 },
      );
    }

    const refundData = refundSnap.data();
    const storeSnap = await db.doc(`stores/${storeId}`).get();
    const storeData = storeSnap.exists ? storeSnap.data() : {};

    return NextResponse.json({
      ...refundData,
      id: refundSnap.id,
      date: refundData.date?.toDate().toISOString(),
      store: {
        name: storeData.name || "Our Store",
        address: storeData.address || "",
        tpn: storeData.tpn || storeData.gstNumber || "N/A",
        phone: storeData.phone || "",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
