import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // Derive storeId
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    const { storeId, type } = userData;

    if (!storeId || type !== "pos") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Recalculate logic
    const itemsRef = db.collection(`stores/${storeId}/items`);
    const summaryRef = db.doc(`stores/${storeId}/inventory_metadata/summary`);

    let totalRetailValue = 0;
    let totalCostValue = 0;

    // Fetch all active items
    const snapshot = await itemsRef.where("isActive", "==", true).get();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const stock = Number(data.stock || 0);
      const retailPrice = Number(data.price || 0);

      totalRetailValue += (stock * retailPrice);
    });

    await summaryRef.set({
      totalRetailValue,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      recalculatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ 
      success: true, 
      totalRetailValue, 
      itemCount: snapshot.size
    });

  } catch (err) {
    console.error("Recalculate totals error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
