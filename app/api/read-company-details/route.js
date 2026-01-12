import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

export async function GET(request) {
  try {
    // 1. Get the token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // 3. Fetch user doc
    const db = admin.firestore();
    const userSnap = await db.doc(`users/${uid}`).get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { storeId } = userSnap.data();
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    // 4. Fetch the store document
    const storeSnap = await db.doc(`stores/${storeId}`).get();
    if (!storeSnap.exists) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // 5. Return store data
    return NextResponse.json(
      {
        uid,
        storeId,
        ...storeSnap.data(), // this will include address, gstNumber, name, phone, isActive, ownerUid, etc.
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch store error:", error);
    return NextResponse.json(
      { message: "Failed to fetch store", error: error.message },
      { status: 500 }
    );
  }
}
