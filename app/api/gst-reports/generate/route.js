import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import Papa from "papaparse";

export const maxDuration = 300; // Allow 5 minutes for generation

export async function GET(request) {
  try {
    const formatDate = (dateVal) => {
      if (!dateVal) return "";
      const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
        .format(d)
        .replace(/ /g, "-");
    };

    // ----------------------------------------------------------------
    // 1. Security Check (Strict Auth)
    // ----------------------------------------------------------------
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = admin.firestore();

    // ----------------------------------------------------------------
    // 2. Fetch User & Store Context
    // ----------------------------------------------------------------
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const storeId = userSnap.data()?.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Store not linked" }, { status: 400 });
    }

    // ----------------------------------------------------------------
    // 3. Date Calculation & Validation
    // ----------------------------------------------------------------
    const { searchParams } = new URL(request.url);
    const targetMonth = searchParams.get("targetMonth"); // e.g., "2026-01"

    let startDate, endDate, monthKey;

    if (targetMonth) {
      // Validate: Cannot generate report for current or future months
      const [tYear, tMonth] = targetMonth.split("-").map(Number);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-indexed

      // if (
      //   tYear > currentYear ||
      //   (tYear === currentYear && tMonth >= currentMonth)
      // ) {
      //   return NextResponse.json(
      //     { error: "Reports can only be generated after the month has ended." },
      //     { status: 400 },
      //   );
      // }

      startDate = new Date(tYear, tMonth - 1, 1);
      endDate = new Date(tYear, tMonth, 0, 23, 59, 59, 999);
      monthKey = targetMonth;
    } else {
      // Default to previous month if not specified (legacy behavior, though UI always sends targetMonth now)
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0-indexed
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
      monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`;
    }

    console.log(`Generating reports for Store: ${storeId}, Month: ${monthKey}`);

    // ----------------------------------------------------------------
    // 4. Initialize Storage
    // ----------------------------------------------------------------
    let storage;
    try {
      if (
        !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
        !process.env.FIREBASE_STORAGE_BUCKET
      ) {
        throw new Error("FIREBASE_STORAGE_BUCKET env var is missing");
      }
      const bucketName =
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        process.env.FIREBASE_STORAGE_BUCKET;
      storage = admin.storage().bucket(bucketName);
    } catch (e) {
      console.error("Storage bucket init failed:", e);
      return NextResponse.json(
        { error: "Storage configuration error", details: e.message },
        { status: 500 },
      );
    }

    // ----------------------------------------------------------------
    // 5. Fetch Data (Single Store)
    // ----------------------------------------------------------------
    const [salesSnap, purchasesSnap, refundsSnap] = await Promise.all([
      db
        .collection(`stores/${storeId}/sales`)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .get(),
      db
        .collection(`stores/${storeId}/purchases`)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .get(),
      db
        .collection(`stores/${storeId}/refunds`)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .get(),
    ]);

    // ----------------------------------------------------------------
    // 6. Generate CSVs
    // ----------------------------------------------------------------

    // B. Output GST (Sales)
    const salesFields = [
      "Invoice ID",
      "Date",
      "Customer Name",
      "Customer CID/TPN",
      "Total Amount",
      "Taxable Amount",
      "GST Amount",
    ];
    const salesData = salesSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        "Invoice ID": data.invoiceNumber,
        Date: formatDate(data.date),
        "Customer Name": data.customerName || "N/A",
        "Customer CID/TPN": data.customerCID || "N/A",
        "Total Amount": data.total || 0,
        "Taxable Amount": data.subtotal || 0,
        "GST Amount": data.gst || 0,
      };
    });
    const outputGstCsv = Papa.unparse({ fields: salesFields, data: salesData });

    // C. Input GST (Purchases)
    const purchaseFields = [
      "Bill Number",
      "Date",
      "Supplier Name",
      "Supplier TIN",
      "Total Purchase",
      "Taxable Amount",
      "Input Tax Claimed",
    ];
    const purchasesData = purchasesSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        "Bill Number": data.billNumber || "N/A",
        Date: formatDate(data.date),
        "Supplier Name": data.supplierName || "N/A",
        "Supplier TIN": data.supplierTIN || "N/A",
        "Total Purchase": data.grossPurchases || 0,
        "Taxable Amount": data.taxablePurchases || 0,
        "Input Tax Claimed": data.itc || 0,
      };
    });
    const inputGstCsv = Papa.unparse({
      fields: purchaseFields,
      data: purchasesData,
    });

    // D. Refunds
    const refundFields = [
      "Refund ID",
      "Date",
      "Original Invoice",
      "Refund Amount",
      "GST Reversed",
      "Reason",
    ];
    const refundsData = refundsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        "Refund ID": data.refundInvoiceNumber,
        Date: formatDate(data.date),
        "Original Invoice": data.originalInvoiceNumber || "N/A",
        "Refund Amount": data.totalAmount || 0,
        "GST Reversed": data.gstAmount || 0,
        Reason: data.reason || "N/A",
      };
    });
    const refundsCsv = Papa.unparse({
      fields: refundFields,
      data: refundsData,
    });

    // ----------------------------------------------------------------
    // 7. Upload to Storage
    // ----------------------------------------------------------------
    const uploadAndGetUrl = async (content, filename) => {
      const filePath = `GSTReports/${storeId}/${filename}`;
      const file = storage.file(filePath);

      await file.save(content, { contentType: "text/csv" });

      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
      return { url, path: filePath };
    };

    const outputGstFile = await uploadAndGetUrl(
      outputGstCsv,
      `OutputGST_${monthKey}.csv`,
    );
    const inputGstFile = await uploadAndGetUrl(
      inputGstCsv,
      `InputGST_${monthKey}.csv`,
    );
    const refundsFile = await uploadAndGetUrl(
      refundsCsv,
      `Refunds_${monthKey}.csv`,
    );

    // ----------------------------------------------------------------
    // 8. Update Firestore & Return
    // ----------------------------------------------------------------
    await db.doc(`stores/${storeId}/gstReports/${monthKey}`).set(
      {
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        files: {
          outputGst: outputGstFile,
          inputGst: inputGstFile,
          refunds: refundsFile,
        },
      },
      { merge: true },
    );

    return NextResponse.json({
      message: `Generated reports for ${monthKey}`,
      files: { outputGstFile, inputGstFile, refundsFile },
    });
  } catch (error) {
    console.error("Report Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
