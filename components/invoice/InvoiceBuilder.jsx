// "use client";

// import { useState, useMemo, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import authFetch from "@/lib/authFetch";
// import InvoicePreview from "./InvoicePreview";
// import { toast } from "react-toastify";

// export default function InvoiceBuilder() {
//   const router = useRouter();
//   const { idToken } = useAuthStatus();

//   const [companyName, setCompanyName] = useState("");
//   const [companyAddress, setCompanyAddress] = useState("");
//   const [gstNumber, setGstNumber] = useState("");
//   const [customerName, setCustomerName] = useState("");
//   const [customerAddress, setCustomerAddress] = useState("");
//   const [customerId, setCustomerId] = useState("");
//   const [items, setItems] = useState([
//     {
//       id: Date.now().toString(),
//       description: "",
//       qty: 1,
//       rate: 0,
//       gstPercent: 0.05, // default 5%
//       isGSTExempt: false,
//     },
//   ]);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   const subtotal = useMemo(() => {
//     return items.reduce(
//       (s, it) => s + Number(it.qty || 0) * Number(it.rate || 0),
//       0
//     );
//   }, [items]);

//   const gstTotal = useMemo(() => {
//     return items.reduce((g, it) => {
//       if (it.isGSTExempt) return g;
//       const lineAmount = Number(it.qty || 0) * Number(it.rate || 0);
//       return g + lineAmount * Number(it.gstPercent || 0); // gstPercent is already in decimal (0.05)
//     }, 0);
//   }, [items]);

//   const total = useMemo(() => subtotal + gstTotal, [subtotal, gstTotal]);

//   function addItem() {
//     setItems((s) => [
//       ...s,
//       {
//         id: Date.now().toString(),
//         description: "",
//         qty: 1,
//         rate: 0,
//         gstPercent: 0.05, // default 5%
//         isGSTExempt: false,
//       },
//     ]);
//   }

//   function updateItem(idx, patch) {
//     setItems((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
//   }

//   function removeItem(idx) {
//     setItems((s) => s.filter((_, i) => i !== idx));
//   }

//   async function handleSave() {
//     setError(null);

//     if (!companyName.trim()) {
//       setError("Company name is required");
//       return;
//     }
//     if (!items.length) {
//       setError("Add at least one line item");
//       return;
//     }

//     setSaving(true);

//     const cartItems = items.map((it) => ({
//       id: it.id,
//       name: it.description || "Unnamed item", // <-- updated here
//       unitPrice: Number(it.rate || 0), // renamed from 'rate'
//       qty: Number(it.qty || 0),
//       isGSTExempt: it.isGSTExempt ?? false,
//     }));

//     try {
//       const body = {
//         gstNumber,
//         cartItems,
//         subtotal,
//         gst: gstTotal,
//         total,
//         customerName,
//         customerAddress,
//         customerId,
//         isPaid: false,
//       };

//       const res = await authFetch(
//         "/api/sales",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(body),
//         },
//         idToken
//       );

//       const json = await res.json();

//       if (!res.ok) {
//         throw new Error(json?.error || "Failed to save");
//       }

//       // On success, navigate to invoice view if id returned
//       if (json?.saleId) {
//         router.push(`/invoice/${json.saleId}`);
//       } else {
//         // fallback: show preview or success state
//         toast.success("Invoice created successfully!");
//         setShowPreview(true);
//       }
//     } catch (err) {
//       setError(err.message || "Failed to save");
//     } finally {
//       setSaving(false);
//       resetInvoice();
//     }
//   }

//   function resetInvoice() {
//     setCompanyName("");
//     setCompanyAddress("");
//     setGstNumber("");
//     setCustomerName("");
//     setCustomerAddress("");
//     setCustomerId("");

//     setItems([
//       {
//         id: Date.now().toString(),
//         description: "",
//         qty: 1,
//         rate: 0,
//         gstPercent: 0.05,
//         isGSTExempt: false,
//       },
//     ]);

//     setShowPreview(false);
//     setError(null);
//   }

//   useEffect(() => {
//     // Fetch store details (only when idToken available)
//     if (!idToken) return;

//     const fetchStoreDetails = async () => {
//       const res = await authFetch("/api/read-company-details", {}, idToken);
//       const data = await res.json();
//       if (res.ok) {
//         // Populate form fields with fetched data
//         setCompanyName(data.name);
//         setCompanyAddress(data.address);
//         setGstNumber(data.gstNumber);
//       }
//     };
//     fetchStoreDetails();
//   }, [idToken]);

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Customer</label>
//           <input
//             className="w-full px-3 py-2 rounded border border-gray-200"
//             value={customerName}
//             onChange={(e) => setCustomerName(e.target.value)}
//             placeholder="Customer name"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">ID #</label>
//           <input
//             className="w-full px-3 py-2 rounded border border-gray-200"
//             value={customerId}
//             onChange={(e) => setCustomerId(e.target.value)}
//             placeholder="Customer ID (CID/Passport No.)"
//           />
//         </div>

//         <div className="md:col-span-2">
//           <label className="block text-sm font-medium mb-1">Address</label>
//           <textarea
//             className="w-full px-3 py-2 rounded border border-gray-200"
//             value={customerAddress}
//             onChange={(e) => setCustomerAddress(e.target.value)}
//             placeholder="Customer Address"
//           />
//         </div>
//       </div>

//       <div className="mt-6">
//         <h3 className="font-medium mb-2">Line items</h3>

//         <div className="space-y-2">
//           {items.map((it, idx) => (
//             <div
//               key={it.id}
//               className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded border border-gray-100 bg-white/50"
//             >
//               <input
//                 className="flex-1 min-w-0 px-2 py-1 rounded border border-gray-200"
//                 placeholder="Description"
//                 value={it.description}
//                 onChange={(e) =>
//                   updateItem(idx, { description: e.target.value })
//                 }
//               />

//               <input
//                 type="number"
//                 className="w-full sm:w-20 px-2 py-1 rounded border border-gray-200"
//                 value={it.qty}
//                 min={0}
//                 onChange={(e) =>
//                   updateItem(idx, { qty: Number(e.target.value) })
//                 }
//               />

//               <input
//                 type="number"
//                 className="w-full sm:w-28 px-2 py-1 rounded border border-gray-200"
//                 value={it.rate}
//                 step="0.01"
//                 min={0}
//                 onChange={(e) =>
//                   updateItem(idx, { rate: Number(e.target.value) })
//                 }
//               />

//               <label className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={it.isGSTExempt}
//                   onChange={(e) =>
//                     updateItem(idx, { isGSTExempt: e.target.checked })
//                   }
//                 />
//                 <span className="text-xs">Exempt</span>
//               </label>

//               <div className="ml-auto text-right text-sm w-full sm:w-auto">
//                 Nu. {(Number(it.qty || 0) * Number(it.rate || 0)).toFixed(2)}
//               </div>

//               <button
//                 className="text-sm text-red-500 mt-1 sm:mt-0 sm:ml-2"
//                 onClick={() => removeItem(idx)}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>

//         <div className="mt-3 flex flex-col sm:flex-row gap-2">
//           <button
//             className="btn-primary px-3 py-2 w-full sm:w-auto"
//             onClick={addItem}
//             type="button"
//           >
//             + Add item
//           </button>

//           <button
//             className="px-3 py-2 border rounded w-full sm:w-auto"
//             onClick={() => setShowPreview((s) => !s)}
//             type="button"
//           >
//             {showPreview ? "Hide Preview" : "Toggle Preview"}
//           </button>
//         </div>
//       </div>

//       <div className="mt-6 p-4 border rounded bg-white dark:bg-gray-800">
//         <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
//           <div className="mb-2 sm:mb-0">
//             <div className="text-sm text-gray-600">Subtotal</div>
//             <div className="text-lg font-medium">Nu. {subtotal.toFixed(2)}</div>
//           </div>

//           <div className="mb-2 sm:mb-0">
//             <div className="text-sm text-gray-600">GST</div>
//             <div className="text-lg font-medium">Nu. {gstTotal.toFixed(2)}</div>
//           </div>

//           <div className="mb-2 sm:mb-0">
//             <div className="text-sm text-gray-600">Total</div>
//             <div className="text-xl font-semibold">Nu. {total.toFixed(2)}</div>
//           </div>

//           <div className="w-full sm:w-auto">
//             <button
//               className="btn-primary px-4 py-2 w-full sm:w-auto"
//               onClick={handleSave}
//               disabled={saving}
//             >
//               {saving ? "Saving..." : "Save & Issue"}
//             </button>
//           </div>
//         </div>

//         {error && <div className="mt-2 text-red-500">{error}</div>}
//       </div>

//       {showPreview && (
//         <div className="mt-6">
//           <InvoicePreview
//             invoice={{
//               companyName,
//               companyAddress,
//               gstNumber,
//               items,
//               subtotal,
//               gst: gstTotal,
//               total,
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

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
  const [customerId, setCustomerId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [items, setItems] = useState([]);

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
          setCompanyName(data.name);
        }
      } catch (e) {
        console.error("Failed to load company info");
      }
    })();
  }, [idToken]);

  const handleSave = async () => {
    if (!customerName) return toast.error("Client Name is required");
    if (items.length === 0)
      return toast.error("Add at least one item to the ledger");

    setSaving(true);
    try {
      const body = {
        cartItems: items,
        subtotal,
        gst: gstTotal,
        total,
        customerName,
        customerAddress,
        customerId,
        isPaid: false,
      };
      const authFetch = (await import("@/lib/authFetch")).default;
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
    if (!tempItem.description || tempItem.unitPrice <= 0) {
      return toast.error("Please provide description and price");
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
    toast.success("Item added to ledger");
  };

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
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <HorizonInput
                label="Reference ID"
                value={customerId}
                onChange={setCustomerId}
                placeholder="CID / License No."
              />
              <HorizonInput
                label="Address"
                value={customerAddress}
                onChange={setCustomerAddress}
                placeholder="Physical Address"
              />
            </div>
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
                className="py-20 border-2 border-dashed border-gray-50 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group"
              >
                <p className="text-[10px] font-black text-gray-300 group-hover:text-green-600 uppercase tracking-widest transition-colors text-center px-6">
                  Workspace is currently empty.
                  <br />
                  Tap to add your first billable item.
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
              invoice={{ companyName, items, subtotal, gst: gstTotal, total }}
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
}) {
  return (
    <div className="group space-y-4">
      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-green-600 transition-colors">
        {label}
      </label>
      <input
        autoFocus={autoFocus}
        type={type}
        className="w-full bg-transparent border-none p-0 text-2xl lg:text-3xl font-bold focus:ring-0 focus:outline-none placeholder:text-gray-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className="h-[2px] w-full bg-gray-200 group-focus-within:bg-green-500 transition-all" />
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
