import admin from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // 1. Get token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // 3. Get requested UID
    const { uid } = await params;

    // 4. Security check (VERY IMPORTANT)
    if (uid !== firebaseUid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5. Fetch user from Firestore
    const userRef = admin.firestore().collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 6. Return user data
    return NextResponse.json(
      {
        uid,
        ...userSnap.data(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch user error:", error);

    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 }
    );
  }
}
