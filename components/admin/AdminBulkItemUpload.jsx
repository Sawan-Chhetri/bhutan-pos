"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import useAuthStatus from "@/hooks/useAuthStatus";
import { getIdTokenResult } from "firebase/auth";

export default function AdminBulkItemUpload() {
  const [selectedStore, setSelectedStore] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [stores, setStores] = useState([]);

  const { user } = useAuthStatus();
  const [isAdmin, setIsAdmin] = useState(false);

  /* ---------------- DB FIELDS (MATCH CSV) ---------------- */
  const DB_FIELDS = [
    { key: "barcode", label: "Barcode" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "price", label: "Selling Price" },
    { key: "stock", label: "Stock" },
  ];

  /* ---------------- ADMIN CHECK ---------------- */
  useEffect(() => {
    if (!user) return;
    getIdTokenResult(user).then((t) => setIsAdmin(!!t.claims.admin));
  }, [user]);

  /* ---------------- FETCH STORES ---------------- */
  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/stores")
      .then((r) => r.json())
      .then((d) => setStores(d.stores || []))
      .catch(() => setStores([]));
  }, [isAdmin]);

  /* ---------------- AUTO MAP ---------------- */
  useEffect(() => {
    if (!csvHeaders.length) return;

    setFieldMap({
      barcode: csvHeaders.find((h) => h.toLowerCase() === "barcode") || "",
      name: csvHeaders.find((h) => h.toLowerCase() === "name") || "",
      category: csvHeaders.find((h) => h.toLowerCase() === "category") || "",
      price:
        csvHeaders.find(
          (h) =>
            h.toLowerCase() === "price" || h.toLowerCase() === "selling price",
        ) || "",
      stock: csvHeaders.find((h) => h.toLowerCase() === "stock") || "",
    });
  }, [csvHeaders]);

  if (!isAdmin) return null;

  /* ---------------- CSV PARSE ---------------- */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
      complete: (results) => {
        setCsvHeaders(results.meta.fields || []);
        setCsvData(results.data || []);
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
      },
    });
  };

  /* ---------------- MANUAL MAP ---------------- */
  const handleFieldMapChange = (key, value) => {
    setFieldMap((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = async () => {
    if (!selectedStore || !user) return;

    setUploading(true);
    setMessage("");

    const items = csvData
      .filter((row) => row[fieldMap.name])
      .map((row) => ({
        barcode: row[fieldMap.barcode]?.trim().toLowerCase(),
        name: row[fieldMap.name]?.trim().toLowerCase(),
        category: row[fieldMap.category]?.trim().toLowerCase(),
        price: Number(row[fieldMap.price]?.toString().replace(/,/g, "") || 0),
        stock: Number(row[fieldMap.stock]?.toString().replace(/,/g, "") || 0),
      }))
      .filter(
        (item) => item.name && item.category && !Number.isNaN(item.price),
      );

    // ✅ Extract unique categories
    const categories = [
      ...new Set(items.map((i) => i.category.trim().toLowerCase())),
    ];

    if (!items.length) {
      setMessage("❌ No valid rows found.");
      setUploading(false);
      return;
    }

    try {
      const token = await user.getIdToken();

      await fetch("/api/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId: selectedStore,
          items,
          categories,
        }),
      });

      setMessage(`✅ Uploaded ${items.length} items`);
      setCsvData([]);
      setCsvHeaders([]);
      setFieldMap({});
    } catch (e) {
      console.error(e);
      setMessage("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-white rounded shadow max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Admin Bulk Item Upload</h2>

      <select
        className="mb-4 p-2 border rounded w-full"
        value={selectedStore}
        onChange={(e) => setSelectedStore(e.target.value)}
      >
        <option value="">-- Select Store --</option>
        {stores.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name || s.id}
          </option>
        ))}
      </select>

      <input type="file" accept=".csv" onChange={handleFile} />

      {csvHeaders.length > 0 && (
        <div className="mt-4">
          {DB_FIELDS.map(({ key, label }) => (
            <div key={key} className="mb-2">
              <label>{label}:</label>
              <select
                value={fieldMap[key] || ""}
                onChange={(e) => handleFieldMapChange(key, e.target.value)}
                className="ml-2 border p-1"
              >
                <option value="">-- Select --</option>
                {csvHeaders.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && <div className="mt-3 font-semibold">{message}</div>}
    </div>
  );
}
