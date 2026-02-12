import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // Get storeId from user
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const storeId = userSnap.data()?.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    // Light-weight read: Only fetching the single store document
    // This document should ideally be small.
    const storeSnap = await db.collection("stores").doc(storeId).get();
    
    if (!storeSnap.exists) {
        return NextResponse.json({ error: "Store doc not found" }, { status: 404 });
    }

    const data = storeSnap.data();
    
    // Convert Firestore Timestamp to millis
    const lastUpdated = data.catalogLastUpdated 
        ? data.catalogLastUpdated.toMillis() 
        : 0;

    return NextResponse.json({ 
        version: lastUpdated,
        storeId 
    });

  } catch (err) {
    console.error("Sync Version Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
