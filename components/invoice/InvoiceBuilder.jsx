"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import InvoicePreview from "./InvoicePreview";
import { toast } from "react-toastify";

export default function InvoiceBuilder() {
  const router = useRouter();
  const { idToken } = useAuthStatus();

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([
    {
      id: Date.now().toString(),
      description: "",
      qty: 1,
      rate: 0,
      gstPercent: 0.05, // default 5%
      isGSTExempt: false,
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const subtotal = useMemo(() => {
    return items.reduce(
      (s, it) => s + Number(it.qty || 0) * Number(it.rate || 0),
      0
    );
  }, [items]);

  const gstTotal = useMemo(() => {
    return items.reduce((g, it) => {
      if (it.isGSTExempt) return g;
      const lineAmount = Number(it.qty || 0) * Number(it.rate || 0);
      return g + lineAmount * Number(it.gstPercent || 0); // gstPercent is already in decimal (0.05)
    }, 0);
  }, [items]);

  const total = useMemo(() => subtotal + gstTotal, [subtotal, gstTotal]);

  function addItem() {
    setItems((s) => [
      ...s,
      {
        id: Date.now().toString(),
        description: "",
        qty: 1,
        rate: 0,
        gstPercent: 0.05, // default 5%
        isGSTExempt: false,
      },
    ]);
  }

  function updateItem(idx, patch) {
    setItems((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function removeItem(idx) {
    setItems((s) => s.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setError(null);

    if (!companyName.trim()) {
      setError("Company name is required");
      return;
    }
    if (!items.length) {
      setError("Add at least one line item");
      return;
    }

    setSaving(true);

    const cartItems = items.map((it) => ({
      id: it.id,
      name: it.description || "Unnamed item", // <-- updated here
      unitPrice: Number(it.rate || 0), // renamed from 'rate'
      qty: Number(it.qty || 0),
      isGSTExempt: it.isGSTExempt ?? false,
    }));

    try {
      const body = {
        gstNumber,
        cartItems,
        subtotal,
        gst: gstTotal,
        total,
        customerName,
        customerAddress,
        customerId,
      };

      const res = await authFetch(
        "/api/sales",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        idToken
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to save");
      }

      // On success, navigate to invoice view if id returned
      if (json?.saleId) {
        router.push(`/invoice/${json.saleId}`);
      } else {
        // fallback: show preview or success state
        toast.success("Invoice created successfully!");
        setShowPreview(true);
      }
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
      resetInvoice();
    }
  }

  function resetInvoice() {
    setCompanyName("");
    setCompanyAddress("");
    setGstNumber("");
    setCustomerName("");
    setCustomerAddress("");
    setCustomerId("");

    setItems([
      {
        id: Date.now().toString(),
        description: "",
        qty: 1,
        rate: 0,
        gstPercent: 0.05,
        isGSTExempt: false,
      },
    ]);

    setShowPreview(false);
    setError(null);
  }

  useEffect(() => {
    // Fetch store details (only when idToken available)
    if (!idToken) return;

    const fetchStoreDetails = async () => {
      const res = await authFetch("/api/read-company-details", {}, idToken);
      const data = await res.json();
      if (res.ok) {
        // Populate form fields with fetched data
        setCompanyName(data.name);
        setCompanyAddress(data.address);
        setGstNumber(data.gstNumber);
      }
    };
    fetchStoreDetails();
  }, [idToken]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <input
            className="w-full px-3 py-2 rounded border border-gray-200"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ID #</label>
          <input
            className="w-full px-3 py-2 rounded border border-gray-200"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Customer ID (CID/Passport No.)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea
            className="w-full px-3 py-2 rounded border border-gray-200"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Customer Address"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Line items</h3>

        <div className="space-y-2">
          {items.map((it, idx) => (
            <div
              key={it.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded border border-gray-100 bg-white/50"
            >
              <input
                className="flex-1 min-w-0 px-2 py-1 rounded border border-gray-200"
                placeholder="Description"
                value={it.description}
                onChange={(e) =>
                  updateItem(idx, { description: e.target.value })
                }
              />

              <input
                type="number"
                className="w-full sm:w-20 px-2 py-1 rounded border border-gray-200"
                value={it.qty}
                min={0}
                onChange={(e) =>
                  updateItem(idx, { qty: Number(e.target.value) })
                }
              />

              <input
                type="number"
                className="w-full sm:w-28 px-2 py-1 rounded border border-gray-200"
                value={it.rate}
                step="0.01"
                min={0}
                onChange={(e) =>
                  updateItem(idx, { rate: Number(e.target.value) })
                }
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={it.isGSTExempt}
                  onChange={(e) =>
                    updateItem(idx, { isGSTExempt: e.target.checked })
                  }
                />
                <span className="text-xs">Exempt</span>
              </label>

              <div className="ml-auto text-right text-sm w-full sm:w-auto">
                Nu. {(Number(it.qty || 0) * Number(it.rate || 0)).toFixed(2)}
              </div>

              <button
                className="text-sm text-red-500 mt-1 sm:mt-0 sm:ml-2"
                onClick={() => removeItem(idx)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <button
            className="btn-primary px-3 py-2 w-full sm:w-auto"
            onClick={addItem}
            type="button"
          >
            + Add item
          </button>

          <button
            className="px-3 py-2 border rounded w-full sm:w-auto"
            onClick={() => setShowPreview((s) => !s)}
            type="button"
          >
            {showPreview ? "Hide Preview" : "Toggle Preview"}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded bg-white dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
          <div className="mb-2 sm:mb-0">
            <div className="text-sm text-gray-600">Subtotal</div>
            <div className="text-lg font-medium">Nu. {subtotal.toFixed(2)}</div>
          </div>

          <div className="mb-2 sm:mb-0">
            <div className="text-sm text-gray-600">GST</div>
            <div className="text-lg font-medium">Nu. {gstTotal.toFixed(2)}</div>
          </div>

          <div className="mb-2 sm:mb-0">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-xl font-semibold">Nu. {total.toFixed(2)}</div>
          </div>

          <div className="w-full sm:w-auto">
            <button
              className="btn-primary px-4 py-2 w-full sm:w-auto"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save & Issue"}
            </button>
          </div>
        </div>

        {error && <div className="mt-2 text-red-500">{error}</div>}
      </div>

      {showPreview && (
        <div className="mt-6">
          <InvoicePreview
            invoice={{
              companyName,
              companyAddress,
              gstNumber,
              items,
              subtotal,
              gst: gstTotal,
              total,
            }}
          />
        </div>
      )}
    </div>
  );
}
