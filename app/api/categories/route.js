import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: "Category name required" },
        { status: 400 }
      );
    }
    
    // Prevent manual creation of 'rooms' or 'room' category
    const normalizedName = name.trim().toLowerCase();
    if (normalizedName === 'rooms' || normalizedName === 'room') {
      return NextResponse.json(
        { error: "The 'rooms' category is system-managed and cannot be created manually." },
        { status: 400 }
      );
    }

    const db = admin.firestore();

    // Get storeId from user
    const userSnap = await db.doc(`users/${uid}`).get();
    const storeId = userSnap.data()?.storeId;

    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    const categoryRef = db.collection(`stores/${storeId}/categories`).doc();

    await categoryRef.set({
      name,
    });

    return NextResponse.json({ id: categoryRef.id });
  } catch (err) {
    console.error("Add category error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

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
    const userData = userSnap.data();
    const storeId = userData?.storeId;
    const userType = userData?.type;

    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    const categoriesSnap = await db
      .collection(`stores/${storeId}/categories`)
      .get();

    let categories = categoriesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Auto-create ROOMS category for hotel users if it doesn't exist
    if (userType === "hotel") {
      const roomsExists = categories.some(cat => cat.name === "rooms");
      if (!roomsExists) {
        const roomsCategoryRef = db.collection(`stores/${storeId}/categories`).doc();
        await roomsCategoryRef.set({
          name: "rooms",
          isSystemManaged: true,
        });
        categories.push({
          id: roomsCategoryRef.id,
          name: "rooms",
          isSystemManaged: true,
        });
      }
    }

    return NextResponse.json(categories);
  } catch (err) {
    console.error("Fetch categories error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
