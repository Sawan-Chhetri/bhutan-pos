"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import InvoicePreview from "./InvoicePreview";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiTrash2,
  FiEye,
  FiUser,
  FiCheck,
  FiX,
  FiActivity,
  FiSend,
  FiLayout,
} from "react-icons/fi";

export default function InvoiceBuilder() {
  const router = useRouter();
  const { idToken } = useAuthStatus();

  // --- STATE ---
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCID, setcustomerCID] = useState("");
  const [customerTIN, setCustomerTIN] = useState(""); // New State for TPN
  const [companyDetails, setCompanyDetails] = useState({
    name: "",
    address: "",
    phone: "",
    gstNumber: "",
  });
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});

  // UI Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempItem, setTempItem] = useState({
    description: "",
    qty: 1,
    unitPrice: 0,
    isGSTExempt: false,
    gstPercent: 0.05,
  });
  const [addMultiple, setAddMultiple] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- CALCULATIONS ---
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + it.qty * it.unitPrice, 0),
    [items],
  );
  const gstTotal = useMemo(
    () =>
      items.reduce(
        (g, it) =>
          it.isGSTExempt ? g : g + it.qty * it.unitPrice * it.gstPercent,
        0,
      ),
    [items],
  );
  const total = subtotal + gstTotal;

  useEffect(() => {
    if (!idToken) return;
    (async () => {
      try {
        const res = await authFetch("/api/read-company-details", {}, idToken);
        const data = await res.json();
        if (res.ok) {
          setCompanyDetails({
            name: data.name,
            address: data.address,
            phone: data.phone,
            gstNumber: data.gstNumber,
          });
        }
      } catch (e) {
        console.error("Failed to load company info");
      }
    })();
  }, [idToken]);

  const handleSave = async () => {
    // Reset errors
    setErrors({});
    let newErrors = {};
    let isValid = true;

    if (!customerName.trim()) {
      newErrors.customerName = "Client Name is required";
      isValid = false;
    }

    if (items.length === 0) {
      newErrors.items = "Add at least one item to the ledger";
      isValid = false;
    }

    if (total >= 50000 && !customerCID.trim()) {
      newErrors.customerCID = "CID is required for amounts over Nu. 50,000";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      // Scroll to top or first error could be good, but for now just showing visual cues
      return;
    }

    setSaving(true);
    try {
      const body = {
        cartItems: items,
        subtotal,
        gst: gstTotal,
        total,
        customerName,
        customerAddress,
        customerCID,
        customerTIN, // Added Customer TPN to payload
        isPaid: false,
      };
      const res = await authFetch(
        "/api/sales",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        idToken,
      );

      const json = await res.json();
      if (res.ok) {
        toast.success("Invoice Issued Successfully");
        router.push(`/invoice/${json.saleId}`);
      } else {
        toast.error(json.message || "Failed to issue invoice");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmAddItem = () => {
    setErrors({});
    if (!tempItem.description) {
      setErrors({ modalDescription: "Description is required" });
      return;
    }
    if (tempItem.unitPrice <= 0) {
      setErrors({ modalPrice: "Price must be greater than 0" });
      return;
    }

    const newItem = { ...tempItem, id: Date.now().toString() };
    setItems([...items, newItem]);

    if (!addMultiple) {
      setIsModalOpen(false);
    }
    setTempItem({
      description: "",
      qty: 1,
      unitPrice: 0,
      isGSTExempt: false,
      gstPercent: 0.05,
    });
    // Removed toast.success("Item added to ledger"); to reduce noise
  };

  // Clear errors when input changes
  useEffect(() => {
    if (errors.customerName && customerName.trim()) {
      setErrors((prev) => ({ ...prev, customerName: null }));
    }
  }, [customerName, errors.customerName]);

  useEffect(() => {
    if (errors.customerCID && customerCID.trim()) {
      setErrors((prev) => ({ ...prev, customerCID: null }));
    }
  }, [customerCID, errors.customerCID]);

  useEffect(() => {
    if (errors.items && items.length > 0) {
      setErrors((prev) => ({ ...prev, items: null }));
    }
  }, [items, errors.items]);

  // Clear modal errors
  useEffect(() => {
    if (errors.modalDescription && tempItem.description) {
      setErrors((prev) => ({ ...prev, modalDescription: null }));
    }
    if (errors.modalPrice && tempItem.unitPrice > 0) {
      setErrors((prev) => ({ ...prev, modalPrice: null }));
    }
  }, [
    tempItem.description,
    tempItem.unitPrice,
    errors.modalDescription,
    errors.modalPrice,
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black transition-all duration-300">
      {/* 1. DESKTOP HEADER (Respects Sidebar) */}
      <header className="hidden lg:flex fixed top-0 right-0 left-64 z-[90] bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between w-full">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Invoice Total
            </span>
            <h2 className="text-3xl font-mono font-black text-green-600">
              Nu. {total.toLocaleString()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(true)}
              className="p-3 px-6 py-3 rounded-full bg-gray-50 text-gray-500 hover:bg-black hover:text-white transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
            >
              <FiEye size={18} /> Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-4 bg-green-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-green-100 disabled:opacity-50"
            >
              {saving ? "Processing..." : "Issue Invoice"}
            </button>
          </div>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE */}
      <main className="max-w-5xl mx-auto pt-24 lg:pt-40 pb-44 lg:pb-20 space-y-10 lg:space-y-16">
        {/* CLIENT ARTBOARD */}
        <section className="bg-white rounded-[2.5rem] p-8 lg:p-14 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-10">
            <FiUser className="text-gray-300" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              Client Identification
            </h3>
          </div>
          <div className="space-y-12">
            <HorizonInput
              label="Recipient Entity"
              value={customerName}
              onChange={setCustomerName}
              placeholder="Client Name"
              error={errors.customerName}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <HorizonInput
                label={
                  total >= 50000
                    ? "CID / Passport Number (Required)"
                    : "CID / Passport Number (Optional)"
                }
                value={customerCID}
                onChange={setcustomerCID}
                placeholder="CID / License No."
                error={errors.customerCID}
              />
              <HorizonInput
                label="Customer TPN (Optional)"
                value={customerTIN}
                onChange={setCustomerTIN}
                placeholder="Tax Payer Number"
              />
            </div>
            <HorizonInput
              label="Address/Contact"
              value={customerAddress}
              onChange={setCustomerAddress}
              placeholder="Physical Address"
            />
          </div>
        </section>

        {/* LEDGER ARTBOARD */}
        <section className="bg-white rounded-[2.5rem] p-8 lg:p-14 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <FiActivity className="text-green-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                Service Ledger
              </h3>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-50 transition-transform active:scale-95"
            >
              <FiPlus /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.length === 0 ? (
              <div
                onClick={() => setIsModalOpen(true)}
                className={`py-20 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group transition-all ${errors.items ? "border-red-300 bg-red-50" : "border-gray-50 hover:border-green-200"}`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors text-center px-6 ${errors.items ? "text-red-500" : "text-gray-300 group-hover:text-green-600"}`}
                >
                  {errors.items ? (
                    <>
                      Validation Error
                      <br />
                      <span className="text-red-400">{errors.items}</span>
                    </>
                  ) : (
                    <>
                      Workspace is currently empty.
                      <br />
                      Tap to add your first billable item.
                    </>
                  )}
                </p>
              </div>
            ) : (
              items.map((it, idx) => (
                <div
                  key={it.id}
                  className="bg-gray-50/50 rounded-[1.8rem] border border-transparent hover:border-green-100 hover:bg-white transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 lg:p-8 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold tracking-tight truncate">
                        {it.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="bg-white px-2 py-1 rounded border border-gray-100">
                          Qty: {it.qty}
                        </span>
                        <span className="bg-white px-2 py-1 rounded border border-gray-100">
                          Rate: {it.unitPrice.toLocaleString()}
                        </span>
                        {it.isGSTExempt && (
                          <span className="text-green-600 font-bold">
                            Tax Exempt
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100/50">
                      <p className="text-2xl font-mono font-black text-green-700 whitespace-nowrap">
                        Nu. {(it.qty * it.unitPrice).toLocaleString()}
                      </p>
                      <button
                        onClick={() =>
                          setItems(items.filter((_, i) => i !== idx))
                        }
                        className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* 4. MOBILE ACTION DOCK (Sticky Bottom) */}
      <div className="lg:hidden fixed bottom-8 left-6 right-6 z-[100]">
        <div className="bg-black text-white rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl border border-white/10 ring-8 ring-[#F8F9FA]">
          <div className="pl-4">
            <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">
              Total Payable
            </p>
            <p className="text-lg font-mono font-black text-green-400">
              Nu. {total.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white active:bg-white/20"
            >
              <FiEye size={20} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 px-6 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {saving ? "..." : "Issue"} <FiSend />
            </button>
          </div>
        </div>
      </div>

      {/* 5. ADD ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-0 lg:p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-t-[3rem] lg:rounded-[3.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 lg:zoom-in-95 duration-300">
            <div className="p-10 lg:p-14 space-y-12">
              <div className="flex justify-between items-center border-b border-gray-50 pb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
                  Entry Detail
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <FiX />
                </button>
              </div>

              <div className="space-y-12">
                <HorizonInput
                  label="Item Description"
                  placeholder="Enter service description..."
                  value={tempItem.description}
                  onChange={(v) => setTempItem({ ...tempItem, description: v })}
                  autoFocus
                  error={errors.modalDescription}
                />
                <div className="grid grid-cols-2 gap-10">
                  <HorizonInput
                    label="Quantity"
                    type="number"
                    value={tempItem.qty}
                    onChange={(v) =>
                      setTempItem({ ...tempItem, qty: Number(v) })
                    }
                  />
                  <HorizonInput
                    label="Unit Rate"
                    type="number"
                    value={tempItem.unitPrice}
                    onChange={(v) =>
                      setTempItem({ ...tempItem, unitPrice: Number(v) })
                    }
                    error={errors.modalPrice}
                  />
                </div>
              </div>

              <div className="space-y-8 pt-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Checkbox
                    label="Tax Exempt"
                    checked={tempItem.isGSTExempt}
                    onChange={(v) =>
                      setTempItem({ ...tempItem, isGSTExempt: v })
                    }
                  />
                  <Checkbox
                    label="Add Multiple"
                    checked={addMultiple}
                    onChange={setAddMultiple}
                  />
                  <div className="sm:ml-auto text-right">
                    <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">
                      Line Total
                    </p>
                    <p className="text-2xl font-mono font-black text-green-600">
                      Nu. {(tempItem.qty * tempItem.unitPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={confirmAddItem}
                  className="w-full py-6 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-green-600 transition-all active:scale-95"
                >
                  Confirm & Add to Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. FULLSCREEN PREVIEW */}
      {showPreview && (
        <div className="fixed inset-0 z-[300] bg-gray-50/50 backdrop-blur-xl overflow-y-auto p-4 lg:p-16 flex justify-center">
          <div className="w-full max-w-4xl relative bg-white min-h-screen p-8 lg:p-20 shadow-2xl rounded-[3rem] animate-in slide-in-from-bottom-20 duration-500">
            <div className="flex justify-between items-center mb-16 border-b border-gray-100 pb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                  !
                </div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-gray-400">
                  Pre-Issue Verification
                </h2>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors"
              >
                Return
              </button>
            </div>
            <InvoicePreview
              invoice={{
                companyDetails,
                customerName,
                customerAddress,
                customerCID,
                customerTIN,
                items,
                subtotal,
                gst: gstTotal,
                total,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- ATOMIC COMPONENTS ---

function HorizonInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus = false,
  error,
}) {
  return (
    <div className="group space-y-4">
      <label
        className={`text-[9px] font-black uppercase tracking-widest ${error ? "text-red-500" : "text-gray-400 group-focus-within:text-green-600"} transition-colors`}
      >
        {label}
      </label>
      <input
        autoFocus={autoFocus}
        type={type}
        onWheel={(e) => type === "number" && e.target.blur()}
        className={`w-full bg-transparent border-none p-0 text-2xl lg:text-3xl font-bold focus:ring-0 focus:outline-none ${error ? "text-red-600 placeholder:text-red-200" : "placeholder:text-gray-200"}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div
        className={`h-[2px] w-full ${error ? "bg-red-500" : "bg-gray-200 group-focus-within:bg-green-500"} transition-all`}
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
    >
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
          checked
            ? "bg-green-600 border-green-600"
            : "border-gray-200 group-hover:border-green-300"
        }`}
      >
        {checked && <FiCheck className="text-white" size={14} />}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">
        {label}
      </span>
    </button>
  );
}
