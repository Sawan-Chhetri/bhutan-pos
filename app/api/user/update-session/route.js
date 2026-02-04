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

    const { activeSessionId } = await request.json();

    if (!activeSessionId) {
      return NextResponse.json({ error: "activeSessionId is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);
    
    // We only update if the user exists
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await userRef.update({
      activeSessionId,
      lastSessionUpdate: admin.firestore.Timestamp.now()
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Session update failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
