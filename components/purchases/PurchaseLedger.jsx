// "use client";
// import { useState, useMemo } from "react";
// import {
//   FiPlus,
//   FiTrash2,
//   FiShoppingBag,
//   FiTruck,
//   FiCheck,
//   FiX,
//   FiFileText,
//   FiArrowDownLeft,
// } from "react-icons/fi";
// import { toast } from "react-toastify";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import authFetch from "@/lib/authFetch";

// export default function PurchaseLedger() {
//   // --- STATE ---
//   const [supplierName, setSupplierName] = useState("");
//   const [supplierTIN, setSupplierTIN] = useState("");
//   const [billNumber, setBillNumber] = useState("");
//   const [items, setItems] = useState([]);
//   const { idToken } = useAuthStatus();

//   // UI Controls
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [tempItem, setTempItem] = useState({
//     description: "",
//     qty: 1,
//     cost: 0,
//     gstPaid: 0,
//   });
//   const [showPreview, setShowPreview] = useState(false);

//   // --- CALCULATIONS ---
//   const totalCost = useMemo(
//     () => items.reduce((s, it) => s + it.qty * it.cost, 0),
//     [items],
//   );
//   const totalITC = useMemo(
//     () => items.reduce((g, it) => g + it.gstPaid, 0),
//     [items],
//   );

//   const recordPurchase = async () => {
//     if (!supplierName || !supplierTIN || !billNumber || items.length === 0) {
//       toast.error("Please complete all fields and add at least one item.");
//       return;
//     }

//     try {
//       const body = {
//         items,
//         itc: totalITC,
//         totalPurchase: totalCost,
//         supplierName,
//         supplierTIN,
//         billNumber,
//       };
//       const res = await authFetch(
//         "/api/purchases",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(body),
//         },
//         idToken,
//       );

//       const json = await res.json();
//       if (res.ok) {
//         toast.success("Invoice Issued Successfully");
//         // router.push(`/invoice/${json.saleId}`);
//       } else {
//         toast.error(json.message || "Failed to issue invoice");
//       }
//     } catch (err) {
//       toast.error("Network error. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8F9FA] text-black flex flex-col items-center">
//       {/* 1. BLUE HEADER (Input Credit Focus) */}
//       <header className="hidden lg:flex fixed top-0 right-0 left-64 z-[90] bg-white/80 backdrop-blur-md border-b border-gray-100 justify-center">
//         <div className="w-full max-w-5xl px-8 h-24 flex items-center justify-between">
//           <div className="flex flex-col">
//             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
//               Total Tax Credit (ITC)
//             </span>
//             <h2 className="text-3xl font-mono font-black text-blue-600 italic">
//               Nu. {totalITC.toLocaleString()}
//             </h2>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="text-right mr-4">
//               <p className="text-[8px] font-black text-gray-400 uppercase">
//                 Total Bill Amt
//               </p>
//               <p className="text-sm font-bold">
//                 Nu. {totalCost.toLocaleString()}
//               </p>
//             </div>
//             <button className="px-10 py-4 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-blue-100">
//               Record Purchase
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* 2. MOBILE HEADER */}
//       <div className="lg:hidden fixed top-0 left-0 right-0 z-[20] bg-white h-16 border-b border-gray-100 flex items-center justify-center">
//         <h1 className="font-black uppercase tracking-[0.2em] text-xs text-blue-600">
//           Purchase <span className="text-black italic">Entry</span>
//         </h1>
//       </div>

//       {/* 3. MAIN WORKSPACE */}
//       <main className="w-full max-w-4xl px-6 pt-24 lg:pt-40 pb-44 lg:pb-20 space-y-10 lg:space-y-16">
//         {/* SUPPLIER ARTBOARD */}
//         <section className="bg-white rounded-[2.5rem] p-8 lg:p-14 shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3 mb-10">
//             <FiTruck className="text-blue-300" />
//             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
//               Supplier / Vendor Details
//             </h3>
//           </div>
//           <div className="space-y-12">
//             <BlueInput
//               label="Supplier Name"
//               value={supplierName}
//               onChange={setSupplierName}
//               placeholder="Wholesaler / Vendor Name"
//             />
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//               <BlueInput
//                 label="Supplier TIN / CID"
//                 value={supplierTIN}
//                 onChange={setSupplierTIN}
//                 placeholder="Critical for ITC Claim"
//               />
//               <BlueInput
//                 label="Vendor Bill Number"
//                 value={billNumber}
//                 onChange={setBillNumber}
//                 placeholder="Invoice # from supplier"
//               />
//             </div>
//           </div>
//         </section>

//         {/* PURCHASE ITEMS ARTBOARD */}
//         <section className="bg-white rounded-[2.5rem] p-8 lg:p-14 shadow-sm border border-gray-100">
//           <div className="flex justify-between items-center mb-10">
//             <div className="flex items-center gap-3">
//               <FiShoppingBag className="text-blue-500" />
//               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
//                 Stock & Expense Items
//               </h3>
//             </div>
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
//             >
//               <FiPlus /> Add Item
//             </button>
//           </div>

//           <div className="space-y-4">
//             {items.length === 0 ? (
//               <div
//                 onClick={() => setIsModalOpen(true)}
//                 className="py-20 border-2 border-dashed border-gray-50 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer"
//               >
//                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
//                   No Purchases Recorded
//                 </p>
//               </div>
//             ) : (
//               items.map((it, idx) => (
//                 <div
//                   key={idx}
//                   className="bg-blue-50/30 rounded-[1.8rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all p-6 lg:p-8"
//                 >
//                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                     <div className="flex-1">
//                       <p className="text-xl font-bold truncate uppercase">
//                         {it.description}
//                       </p>
//                       <div className="flex gap-4 mt-2 text-[9px] font-black text-blue-400 uppercase tracking-widest">
//                         <span>Qty: {it.qty}</span>
//                         <span>Unit Cost: {it.cost}</span>
//                         <span className="bg-blue-600 text-white px-2 py-0.5 rounded">
//                           ITC: Nu. {it.gstPaid}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between md:justify-end gap-6">
//                       <p className="text-2xl font-mono font-black text-gray-700">
//                         Nu. {(it.qty * it.cost).toLocaleString()}
//                       </p>
//                       <button
//                         onClick={() =>
//                           setItems(items.filter((_, i) => i !== idx))
//                         }
//                         className="p-3 text-gray-200 hover:text-red-500 transition-all"
//                       >
//                         <FiTrash2 size={20} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </section>
//       </main>

//       {/* 4. MOBILE ACTION DOCK (Blue Theme) */}
//       <div className="lg:hidden fixed bottom-8 left-6 right-6 z-[100]">
//         <div className="bg-blue-900 text-white rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl ring-8 ring-[#F8F9FA]">
//           <div className="pl-4">
//             <p className="text-[7px] font-black text-blue-300 uppercase tracking-widest">
//               Total ITC Claim
//             </p>
//             <p className="text-lg font-mono font-black text-white">
//               Nu. {totalITC.toLocaleString()}
//             </p>
//           </div>
//           <button
//             onClick={recordPurchase}
//             className="bg-white text-blue-900 px-6 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
//           >
//             Record Purchase
//           </button>
//         </div>
//       </div>

//       {/* 5. PURCHASE MODAL */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center">
//           <div
//             className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm"
//             onClick={() => setIsModalOpen(false)}
//           />
//           <div className="relative w-full max-w-xl bg-white rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl p-10 lg:p-14">
//             <div className="flex justify-between items-center mb-10">
//               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic">
//                 Expense Entry
//               </span>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"
//               >
//                 <FiX />
//               </button>
//             </div>
//             <div className="space-y-10">
//               <BlueInput
//                 label="Item / Service Name"
//                 value={tempItem.description}
//                 onChange={(v) => setTempItem({ ...tempItem, description: v })}
//               />
//               <div className="grid grid-cols-3 gap-6">
//                 <BlueInput
//                   label="Qty"
//                   type="number"
//                   value={tempItem.qty}
//                   onChange={(v) => setTempItem({ ...tempItem, qty: Number(v) })}
//                 />
//                 <BlueInput
//                   label="Cost (Excl. Tax)"
//                   type="number"
//                   value={tempItem.cost}
//                   onChange={(v) =>
//                     setTempItem({ ...tempItem, cost: Number(v) })
//                   }
//                 />
//                 <BlueInput
//                   label="GST Paid"
//                   type="number"
//                   value={tempItem.gstPaid}
//                   onChange={(v) =>
//                     setTempItem({ ...tempItem, gstPaid: Number(v) })
//                   }
//                 />
//               </div>
//               <button
//                 onClick={() => {
//                   setItems([...items, tempItem]);
//                   setIsModalOpen(false);
//                   setTempItem({ description: "", qty: 1, cost: 0, gstPaid: 0 });
//                 }}
//                 className="w-full py-6 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl"
//               >
//                 Add to Purchase Ledger
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function BlueInput({ label, value, onChange, placeholder, type = "text" }) {
//   return (
//     <div className="group space-y-4 text-left">
//       <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-blue-600">
//         {label}
//       </label>
//       <input
//         type={type}
//         className="w-full bg-transparent p-2 text-2xl font-bold focus:ring-0 focus:outline-none placeholder:text-gray-100"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//       />
//       <div className="h-[2px] w-full bg-gray-200 group-focus-within:bg-blue-500 transition-all" />
//     </div>
//   );
// }

"use client";
import { useState, useMemo } from "react";
import {
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiTruck,
  FiCheck,
  FiX,
  FiActivity,
  FiPercent,
} from "react-icons/fi";
import { toast } from "react-toastify";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";

export default function PurchaseLedger() {
  const { idToken } = useAuthStatus();
  const [saving, setSaving] = useState(false);

  // --- FORM STATE ---
  const [supplierName, setSupplierName] = useState("");
  const [supplierTIN, setSupplierTIN] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [items, setItems] = useState([]);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempItem, setTempItem] = useState({
    description: "",
    qty: 1,
    cost: 0,
    isTaxable: true,
  });

  // --- CALCULATIONS ---
  // Assuming standard 5% GST for calculation
  const GST_RATE = 0.05;

  const totalCost = useMemo(
    () => items.reduce((s, it) => s + it.qty * it.cost, 0),
    [items],
  );

  const totalITC = useMemo(
    () =>
      items.reduce(
        (g, it) => g + (it.isTaxable ? it.qty * it.cost * GST_RATE : 0),
        0,
      ),
    [items],
  );

  const handleAddItem = () => {
    if (!tempItem.description || tempItem.cost <= 0) {
      return toast.error("Please enter a description and cost");
    }
    const newItem = {
      ...tempItem,
      id: Date.now().toString(),
      gstAmount: tempItem.isTaxable
        ? tempItem.qty * tempItem.cost * GST_RATE
        : 0,
    };
    setItems([...items, newItem]);
    setTempItem({ description: "", qty: 1, cost: 0, isTaxable: true });
    setIsModalOpen(false);
  };

  const recordPurchase = async () => {
    if (!supplierName || !supplierTIN || !billNumber || items.length === 0) {
      return toast.error("Missing required purchase details.");
    }
    setSaving(true);
    try {
      const body = {
        items,
        itc: totalITC,
        totalPurchases: totalCost,
        supplierName,
        supplierTIN,
        billNumber,
      };
      const res = await authFetch(
        "/api/purchases",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        idToken,
      );

      if (res.ok) {
        toast.success("Purchase Recorded Successfully");
        setItems([]);
        setSupplierName("");
        setSupplierTIN("");
        setBillNumber("");
      } else {
        const json = await res.json();
        toast.error(json.message || "Failed to record purchase");
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black flex flex-col items-center">
      {/* 1. DESKTOP HEADER */}
      <header className="hidden lg:flex fixed top-0 right-0 left-64 z-[90] bg-white/80 backdrop-blur-md border-b border-gray-100 justify-center">
        <div className="w-full max-w-5xl px-8 h-24 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
              Total Input Credit (ITC)
            </span>
            <h2 className="text-3xl font-mono font-black text-blue-600 italic">
              Nu. {totalITC.toLocaleString()}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Gross Total
              </p>
              <p className="text-sm font-bold">
                Nu. {totalCost.toLocaleString()}
              </p>
            </div>
            <button
              onClick={recordPurchase}
              disabled={saving}
              className="px-10 py-4 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl"
            >
              {saving ? "Syncing..." : "Record Purchase"}
            </button>
          </div>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE */}
      <main className="w-full max-w-4xl px-6 pt-24 lg:pt-40 pb-44 lg:pb-20 space-y-12">
        <section className="bg-white rounded-[2.5rem] p-8 lg:p-14 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-10 text-blue-600">
            <FiTruck size={20} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              Supplier Ledger
            </h3>
          </div>
          <div className="space-y-12">
            <BlueInput
              label="Supplier Name"
              value={supplierName}
              onChange={setSupplierName}
              placeholder="Vendor Name"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <BlueInput
                label="Supplier GST TPN / CID"
                value={supplierTIN}
                onChange={setSupplierTIN}
                placeholder="Tax Identity"
              />
              <BlueInput
                label="Invoice Number"
                value={billNumber}
                onChange={setBillNumber}
                placeholder="Ref #"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 lg:p-14 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              Expense Items
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <FiPlus /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((it, idx) => (
              <div
                key={it.id}
                className="bg-blue-50/30 rounded-[1.8rem] p-6 lg:p-8 flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <div className="flex-1">
                  <p className="text-xl font-bold uppercase">
                    {it.description}
                  </p>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">
                    Qty: {it.qty} • Cost: {it.cost}{" "}
                    {it.isTaxable && (
                      <span className="ml-2 bg-blue-600 text-white px-2 py-0.5 rounded">
                        ITC: Nu. {it.gstAmount}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-2xl font-mono font-black italic">
                    Nu. {(it.qty * it.cost).toLocaleString()}
                  </p>
                  <button
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 4. MOBILE ACTION DOCK (Blue Theme) */}
      <div className="lg:hidden fixed bottom-8 left-6 right-6 z-[100]">
        <div className="bg-blue-900 text-white rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl ring-8 ring-[#F8F9FA]">
          <div className="pl-4">
            <p className="text-[7px] font-black text-blue-300 uppercase tracking-widest">
              Total ITC Claim
            </p>
            <p className="text-lg font-mono font-black text-white">
              Nu. {totalITC.toLocaleString()}
            </p>
          </div>
          <button
            onClick={recordPurchase}
            className="bg-white text-blue-900 px-6 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
          >
            Record Purchase
          </button>
        </div>
      </div>

      {/* 5. ADD ITEM MODAL WITH TAX TOGGLE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-0 lg:p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl p-10 lg:p-14">
            <div className="flex justify-between items-center mb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic">
                Expense Entry
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-10">
              <BlueInput
                label="Description"
                value={tempItem.description}
                onChange={(v) => setTempItem({ ...tempItem, description: v })}
              />

              <div className="grid grid-cols-2 gap-10">
                <BlueInput
                  label="Qty"
                  type="number"
                  value={tempItem.qty}
                  onChange={(v) => setTempItem({ ...tempItem, qty: Number(v) })}
                />
                <BlueInput
                  label="Unit Cost"
                  type="number"
                  value={tempItem.cost}
                  onChange={(v) =>
                    setTempItem({ ...tempItem, cost: Number(v) })
                  }
                />
              </div>

              {/* GST TOGGLE SECTION */}
              <div className="flex items-center justify-between p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl ${tempItem.isTaxable ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}
                  >
                    <FiPercent size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-900">
                      Taxable Purchase
                    </p>
                    <p className="text-[9px] text-blue-400 uppercase font-bold">
                      Claim 5% Input Credit
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setTempItem({ ...tempItem, isTaxable: !tempItem.isTaxable })
                  }
                  className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${tempItem.isTaxable ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${tempItem.isTaxable ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                    Calculated GST
                  </p>
                  <p className="text-lg font-mono font-bold text-blue-600">
                    Nu.{" "}
                    {tempItem.isTaxable
                      ? (
                          tempItem.qty *
                          tempItem.cost *
                          GST_RATE
                        ).toLocaleString()
                      : "0.00"}
                  </p>
                </div>
                <button
                  onClick={handleAddItem}
                  className="px-10 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all"
                >
                  Add to Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlueInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="group space-y-4 text-left">
      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-blue-600">
        {label}
      </label>
      <input
        type={type}
        className="w-full bg-transparent p-0 text-2xl font-bold focus:ring-0 focus:outline-none placeholder:text-gray-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className="h-[2px] w-full bg-gray-100 group-focus-within:bg-blue-500 transition-all" />
    </div>
  );
}
