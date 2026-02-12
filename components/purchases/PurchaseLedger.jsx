"use client";
import { useState, useMemo, useContext, useEffect } from "react";
import { UserContext } from "@/contexts/UserContext";
import {
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiTruck,
  FiCheck,
  FiX,
  FiActivity,
  FiPercent,
  FiSearch,
} from "react-icons/fi";
import { toast } from "react-toastify";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import usePermissions from "@/hooks/usePermissions";

export default function PurchaseLedger() {
  const { idToken } = useAuthStatus();
  const { user } = useContext(UserContext);
  const permissions = usePermissions(user);
  const [saving, setSaving] = useState(false);

  // --- FORM STATE ---
  const [supplierName, setSupplierName] = useState("");
  const [supplierTIN, setSupplierTIN] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [items, setItems] = useState([]);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempItem, setTempItem] = useState({
    description: "",
    qty: 1,
    cost: 0,
    isTaxable: true,
    itemId: null, // Track the ID
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // --- ERROR STATE ---
  const [errors, setErrors] = useState({});

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

  const totalGST = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (it.isTaxable ? it.qty * it.cost * GST_RATE : 0),
        0,
      ),
    [items],
  );

  const grossTotal = totalCost + totalGST;

  // --- EFFECTS ---
  // Error clearing effects
  useEffect(() => {
    if (errors.supplierName && supplierName.trim())
      setErrors((e) => ({ ...e, supplierName: null }));
  }, [supplierName, errors.supplierName]);

  useEffect(() => {
    if (errors.supplierTIN && supplierTIN.trim())
      setErrors((e) => ({ ...e, supplierTIN: null }));
  }, [supplierTIN, errors.supplierTIN]);

  useEffect(() => {
    if (errors.billNumber && billNumber.trim())
      setErrors((e) => ({ ...e, billNumber: null }));
  }, [billNumber, errors.billNumber]);

  useEffect(() => {
    if (errors.purchaseDate && purchaseDate.trim())
      setErrors((e) => ({ ...e, purchaseDate: null }));
  }, [purchaseDate, errors.purchaseDate]);

  useEffect(() => {
    if (errors.items && items.length > 0)
      setErrors((e) => ({ ...e, items: null }));
  }, [items, errors.items]);

  useEffect(() => {
    if (errors.modalDescription && tempItem.description)
      setErrors((e) => ({ ...e, modalDescription: null }));
    if (errors.modalCost && tempItem.cost > 0)
      setErrors((e) => ({ ...e, modalCost: null }));
  }, [
    tempItem.description,
    tempItem.cost,
    errors.modalDescription,
    errors.modalCost,
  ]);

  const handleAddItem = () => {
    setErrors({});
    let newErrors = {};
    let isValid = true;

    if (!tempItem.description) {
      newErrors.modalDescription = "Description is required";
      isValid = false;
    }
    if (tempItem.cost <= 0) {
      newErrors.modalCost = "Cost must be > 0";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    const newItem = {
      ...tempItem,
      id: Date.now().toString(),
      gstAmount: tempItem.isTaxable
        ? tempItem.qty * tempItem.cost * GST_RATE
        : 0,
    };
    setItems([...items, newItem]);
    setTempItem({
      description: "",
      qty: 1,
      cost: 0,
      isTaxable: true,
      itemId: null,
    });
    setSearchQuery("");
    setSearchResults([]);
    setIsModalOpen(false);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    // Always update description for free text
    // If we select an item later, it will overwrite this
    // If not, this is what goes to the DB (for 'other' users or valid free text)
    // Actually the onChange calling this ALREADY does setTempItem... wait.
    // The onChange below does:
    // onChange={(v) => { handleSearch(v); setIsSearching(true); setTempItem(...) }}

    if (!query) {
      setSearchResults([]);
      return;
    }

    // Only search for POS users
    if (!permissions.canSearchInventory) return;

    try {
      const storeId = user?.storeId;
      if (!storeId) return;

      const res = await fetch(
        `/api/search-items?query=${encodeURIComponent(query)}&storeId=${storeId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  const selectItem = (item) => {
    setTempItem({
      ...tempItem,
      description: item.name,
      // cost: item.price, // Optional: pre-fill cost if desired? Usually cost != price.
      itemId: item.id,
    });
    setSearchQuery(item.name);
    setSearchResults([]);
    setIsSearching(false);
  };

  const recordPurchase = async () => {
    setErrors({});
    let newErrors = {};
    let isValid = true;

    if (!supplierName) {
      newErrors.supplierName = true;
      isValid = false;
    }
    if (!supplierTIN) {
      newErrors.supplierTIN = true;
      isValid = false;
    }
    if (!billNumber) {
      newErrors.billNumber = true;
      isValid = false;
    }

    if (!purchaseDate) {
      newErrors.purchaseDate = true;
      isValid = false;
    }

    if (items.length === 0) {
      newErrors.items = "Add items";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      // Optional: scroll to top
      return;
    }

    setSaving(true);
    try {
      const body = {
        items,
        supplierName,
        supplierTIN,
        billNumber,
        date: purchaseDate, // Send the date
        // Purchase calculations all performed on the server side
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
        setPurchaseDate("");
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
                Nu. {grossTotal.toLocaleString()}
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
              error={errors.supplierName}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <BlueInput
                label="Supplier GST TPN / CID"
                value={supplierTIN}
                onChange={setSupplierTIN}
                placeholder="Tax Identity"
                error={errors.supplierTIN}
              />
              <BlueInput
                label="Invoice Number"
                value={billNumber}
                onChange={setBillNumber}
                placeholder="Ref #"
                error={errors.billNumber}
              />
              <BlueInput
                label="Purchase Date"
                value={purchaseDate}
                onChange={setPurchaseDate}
                placeholder="YYYY-MM-DD"
                type="date"
                error={errors.purchaseDate}
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
            {items.length === 0 ? (
              <div
                onClick={() => setIsModalOpen(true)}
                className={`py-20 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group transition-all ${errors.items ? "border-red-300 bg-red-50" : "border-blue-50/50 hover:border-blue-200"}`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors text-center px-6 ${errors.items ? "text-red-500" : "text-gray-300 group-hover:text-blue-600"}`}
                >
                  {errors.items ? (
                    <>
                      Validation Error
                      <br />
                      <span className="text-red-400">{errors.items}</span>
                    </>
                  ) : (
                    <>
                      No Purchases Recorded
                      <br />
                      Tap to add items
                    </>
                  )}
                </p>
              </div>
            ) : (
              items.map((it, idx) => (
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
                      onClick={() =>
                        setItems(items.filter((_, i) => i !== idx))
                      }
                      className="text-gray-300 hover:text-red-500"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
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
              <div className="relative">
                <BlueInput
                  label={
                    permissions.canSearchInventory
                      ? "Search Item / Service"
                      : "Description"
                  }
                  value={searchQuery}
                  onChange={(v) => {
                    setSearchQuery(v);
                    setTempItem({ ...tempItem, description: v, itemId: null });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(searchQuery);
                      setIsSearching(true);
                    }
                  }}
                  onFocus={() => setIsSearching(true)}
                  error={errors.modalDescription}
                />

                {permissions.canSearchInventory && (
                  <div className="absolute top-9 right-0 flex items-center gap-2">
                    <span className="hidden sm:inline-block text-[9px] font-bold text-gray-300 uppercase tracking-wider mr-2">
                      Press Enter ↵
                    </span>
                    <button
                      onClick={() => {
                        handleSearch(searchQuery);
                        setIsSearching(true);
                      }}
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
                    >
                      <FiSearch size={16} />
                    </button>
                  </div>
                )}
                {permissions.canSearchInventory &&
                  isSearching &&
                  searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-xl rounded-xl mt-2 max-h-48 overflow-y-auto border border-gray-100">
                      {searchResults.map((res) => (
                        <button
                          key={res.id}
                          onClick={() => selectItem(res)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-bold border-b border-gray-50 last:border-none flex justify-between items-center"
                        >
                          <div className="flex flex-col">
                            <span>{res.name}</span>
                            {res.barcode && (
                              <span className="text-[10px] text-gray-400 font-mono font-normal">
                                SKU: {res.barcode}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 font-normal">
                            Nu. {res.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>

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
                  error={errors.modalCost}
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

function BlueInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  ...props
}) {
  return (
    <div className="group space-y-4 text-left">
      <label
        className={`text-[9px] font-black uppercase tracking-widest ${error ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-600"} transition-colors`}
      >
        {label}
      </label>
      <input
        type={type}
        onWheel={(e) => type === "number" && e.target.blur()}
        className={`w-full bg-transparent p-0 text-2xl font-bold focus:ring-0 focus:outline-none ${error ? "text-red-600 placeholder:text-red-200" : "placeholder:text-gray-100"}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
      <div
        className={`h-0.5 w-full ${error ? "bg-red-500" : "bg-gray-100 group-focus-within:bg-blue-500"} transition-all`}
      />
    </div>
  );
}
