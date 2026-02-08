// "use client";

// import { useEffect, useState, useContext } from "react";
// import Search from "@/components/pos/Search";
// import Menu from "@/components/pos/Menu";
// import Checkout from "@/components/pos/Checkout";
// import PosScreen from "@/components/pos/PosScreen";
// import { UserContext } from "@/contexts/UserContext";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import authFetch from "@/lib/authFetch";

// const bhutanGST = 0.05; // 5% GST

// function PosLayout() {
//   const [cartItems, setCartItems] = useState([]);
//   const [activeCategory, setActiveCategory] = useState(); // will be set by Menu
//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const { idToken } = useAuthStatus();
//   const { user } = useContext(UserContext);

//   const [itemsByCategory, setItemsByCategory] = useState({});

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);

//   // Display items for active category
//   const displayedProducts = activeCategory
//     ? itemsByCategory[activeCategory] || []
//     : [];

//   // Add to cart
//   const handleAddToCart = (product) => {
//     const existing = cartItems.find((item) => item.id === product.id);
//     if (existing) {
//       setCartItems((prev) =>
//         prev.map((item) =>
//           item.id === product.id ? { ...item, qty: item.qty + 1 } : item
//         )
//       );
//     } else {
//       setCartItems((prev) => [
//         ...prev,
//         {
//           id: product.id,
//           name: product.name,
//           unitPrice: product.price,
//           qty: 1,
//           isGSTExempt: product.isGSTExempt || false,
//         },
//       ]);
//     }
//   };

//   // Totals
//   // Subtotal for all items (same as before)
//   const subtotal = cartItems.reduce(
//     (sum, item) => sum + item.qty * item.unitPrice,
//     0
//   );

//   // GST only on items that are not GST exempt
//   const gst = cartItems.reduce((sum, item) => {
//     if (item.isGSTExempt) return sum; // skip exempt items
//     return sum + item.qty * item.unitPrice * bhutanGST;
//   }, 0);

//   // Total = subtotal + GST
//   const total = subtotal + gst;

//   // Fetch items for the active category if not already fetched
//   useEffect(() => {
//     if (!activeCategory || !idToken) return;
//     if (itemsByCategory[activeCategory]) return; // already fetched

//     const fetchItemsForCategory = async () => {
//       try {
//         const res = await authFetch(
//           `/api/readItemsByCategory?category=${encodeURIComponent(
//             activeCategory
//           )}`,
//           {},
//           idToken
//         );

//         if (!res.ok) return;

//         const data = await res.json();
//         setItemsByCategory((prev) => ({
//           ...prev,
//           [activeCategory]: data,
//         }));
//         console.log(data);
//       } catch (err) {
//         console.error("Fetch items error:", err);
//       }
//     };

//     fetchItemsForCategory();
//   }, [activeCategory, idToken, itemsByCategory]);

//   // Update when searchQuery changes
//   useEffect(() => {
//     setIsSearching(searchQuery.trim().length > 0);
//   }, [searchQuery]);

//   return (
//     <div className="h-screen flex flex-col dark:bg-gray-900 dark:text-white">
//       {/* Search */}
//       <div className="p-4 border-b dark:border-gray-700">
//         <Search
//           value={searchQuery}
//           onChange={setSearchQuery}
//           itemsByCategory={itemsByCategory}
//           activeCategory={activeCategory}
//           user={user}
//           onSearchResult={(results) => {
//             setSearchResults(results);
//           }}
//         />
//       </div>

//       {/* Mobile Menu */}
//       <div className="lg:hidden p-2 border-b overflow-x-auto flex gap-2 dark:border-gray-700">
//         <Menu active={activeCategory} onChange={setActiveCategory} />
//       </div>

//       {/* Main Content */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Desktop Menu */}
//         <div className="hidden lg:block overflow-y-auto border-r w-48 p-4 dark:border-gray-700">
//           <Menu
//             active={activeCategory}
//             onChange={setActiveCategory}
//             isSearching={isSearching}
//           />
//         </div>

//         {/* POS Screen */}
//         <div className="flex-1 overflow-y-auto">
//           <PosScreen
//             products={
//               searchQuery
//                 ? searchResults
//                 : itemsByCategory[activeCategory] || []
//             }
//             // products={displayedProducts}
//             cartItems={cartItems}
//             onAddToCart={handleAddToCart}
//           />
//         </div>

//         {/* Desktop Checkout */}
//         <div className="hidden lg:block w-96 border-l dark:border-gray-700">
//           <Checkout
//             cartItems={cartItems}
//             subtotal={subtotal}
//             gst={gst}
//             total={total}
//             setCartItems={setCartItems}
//           />
//         </div>
//       </div>

//       {/* Mobile Checkout Button */}
//       <button
//         onClick={() => setIsCheckoutOpen(true)}
//         className="lg:hidden fixed bottom-4 left-4 right-4 btn-primary font-semibold py-3 rounded-xl shadow-lg flex justify-center items-center gap-2"
//       >
//         View Cart
//         <span className="bg-white text-black rounded-full px-2 py-1 text-xs font-bold">
//           {cartItems.length}
//         </span>
//       </button>

//       {/* Mobile Checkout Modal */}
//       {isCheckoutOpen && (
//         <div className="lg:hidden fixed inset-0 z-50 bg-black/40">
//           <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl h-[85%] flex flex-col animate-slideUp">
//             <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 border-b flex justify-between items-center dark:border-gray-700">
//               <h2 className="font-semibold text-lg">Checkout</h2>
//               <button
//                 onClick={() => setIsCheckoutOpen(false)}
//                 className="text-gray-500 dark:text-gray-300 text-xl"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//               <Checkout
//                 cartItems={cartItems}
//                 subtotal={subtotal}
//                 gst={gst}
//                 total={total}
//                 setCartItems={setCartItems}
//                 hidePayButton
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default PosLayout;

"use client";
import { useEffect, useState, useContext } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Search from "@/components/pos/Search";
import Menu from "@/components/pos/Menu";
import Checkout from "@/components/pos/Checkout";
import PosScreen from "@/components/pos/PosScreen";
import { UserContext } from "@/contexts/UserContext";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import {
  FiShoppingCart,
  FiX,
  FiArrowLeft,
  FiHome,
  FiCoffee,
} from "react-icons/fi";
import useBarcodeScanner from "@/hooks/useBarcodeScanner";
import { toast } from "react-toastify";
import PrintReceiptModal from "@/components/pos/PrintReceiptModal";
import KgModal from "@/components/pos/KgModal";
import usePermissions from "@/hooks/usePermissions";

import { addToScanCache, getFromScanCache } from "@/lib/scanCache";

const bhutanGST = 0.05;

function PosLayout() {
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { idToken } = useAuthStatus(); // <--- Added this line
  const permissions = usePermissions(user);

  // Dual-Mode State for Hotels
  const [posMode, setPosMode] = useState(
    permissions.isHotelUser ? "rooms" : "restaurant",
  );

  // SWR for items with Smart Timestamp Caching
  // We use a custom fetcher wrapper to handle the "Not Modified" signal
  const activeCategoryKey = activeCategory
    ? `/api/readItemsByCategory?category=${encodeURIComponent(activeCategory)}`
    : null;

  const { data: itemsData, error: itemsError } = useSWR(
    activeCategoryKey,
    async (url) => {
      // 1. Get last fetch timestamp for this category from localStorage
      const cacheKey = `cat_ts_${activeCategory}`;
      const lastTs = localStorage.getItem(cacheKey);

      // 2. Append timestamp to URL
      const fullUrl = lastTs ? `${url}&ts=${lastTs}` : url;

      const res = await (
        await import("@/lib/authFetch")
      ).default(fullUrl, {}, null); // authFetch will grab current user token automatically
      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();

      // 3. Handle 304 Not Modified
      if (json.notModified) {
        // Return cached data from localStorage
        const cachedItems = localStorage.getItem(`cat_data_${activeCategory}`);
        return cachedItems ? JSON.parse(cachedItems) : [];
      }

      // 4. Save new data and timestamp
      if (json.items) {
        try {
          localStorage.setItem(
            `cat_data_${activeCategory}`,
            JSON.stringify(json.items),
          );
          localStorage.setItem(cacheKey, json.timestamp.toString());
        } catch (error) {
          console.warn("LocalStorage quota exceeded. Skipping cache.");
        }
        return json.items;
      }

      return [];
    },
  );

  const itemsForCategory = itemsData || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [saleId, setSaleId] = useState(null);
  const [isKgModalOpen, setIsKgModalOpen] = useState(false);
  const [pendingWeightedItem, setPendingWeightedItem] = useState(null);

  // Global Discount State
  const [globalDiscount, setGlobalDiscount] = useState({
    value: 0,
    type: "percent",
    reason: "",
  });

  const addItemToCart = (product, qty) => {
    // Hotel Room Check: Do not stack rooms
    const isHotelRoom =
      permissions?.isHotelUser &&
      (product.category === "rooms" || product.category === "room");

    if (isHotelRoom) {
      setCartItems((prev) => [
        ...prev,
        {
          cartId: Math.random().toString(36).substr(2, 9),
          id: product.id,
          name: product.name,
          unitPrice: product.price, // Base Sale Price
          discountPercent: product.discountPercent || 0, // Item-Level Discount
          qty: qty,
          isGSTExempt: product.isGSTExempt || false,
          unitType: product.unitType || "default",
          category: product.category,
        },
      ]);
      return;
    }

    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item,
        ),
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          cartId: Math.random().toString(36).substr(2, 9),
          id: product.id,
          name: product.name,
          unitPrice: product.price, // Base Sale Price
          discountPercent: product.discountPercent || 0, // Item-Level Discount
          qty: qty,
          isGSTExempt: product.isGSTExempt || false,
          unitType: product.unitType || "default",
          category: product.category || "general",
        },
      ]);
    }
  };

  const handleWeightConfirm = (qty) => {
    if (pendingWeightedItem) {
      addItemToCart(pendingWeightedItem, qty);
      setPendingWeightedItem(null);
    }
  };

  const handleAddToCart = (product) => {
    if (product.unitType && product.unitType !== "default") {
      setPendingWeightedItem(product);
      setIsKgModalOpen(true);
      return;
    }
    addItemToCart(product, 1);
  };

  /* ---------------------------------------------
   * 🧮 CALCULATION ENGINE (STACKED DISCOUNTS)
   * --------------------------------------------- */

  // Step 1: Item-Level Calculation (Effective Price)
  // Step 2: Net Subtotal (Sum of effectivePrices)
  const netSubtotal = cartItems.reduce((sum, item) => {
    const effectivePrice =
      item.unitPrice * (1 - (item.discountPercent || 0) / 100);
    return sum + item.qty * effectivePrice;
  }, 0);

  // Step 3: Global Discount (Checkout Level)
  let finalBeforeTax = netSubtotal;
  if (globalDiscount.type === "percent") {
    finalBeforeTax = netSubtotal * (1 - (globalDiscount.value || 0) / 100);
  } else {
    finalBeforeTax = Math.max(0, netSubtotal - (globalDiscount.value || 0));
  }

  // Step 4: Tax Calculation (Pro-rata applied to non-exempt items)
  // We apply the global discount ratio to the taxable subtotal
  const discountRatio = netSubtotal > 0 ? finalBeforeTax / netSubtotal : 1;

  const gst = cartItems.reduce((sum, item) => {
    if (item.isGSTExempt) return sum;
    const itemEffectiveSubtotal =
      item.qty * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
    const itemFinalSubtotal = itemEffectiveSubtotal * discountRatio;
    return sum + itemFinalSubtotal * bhutanGST;
  }, 0);

  // Step 5: Grand Total
  const total = finalBeforeTax + gst;

  /* ---------------------------------------------
   * 🛒 BARCODE SCANNER LOGIC
   * --------------------------------------------- */
  const handleScan = async (barcode) => {
    if (!barcode) return;

    // 1. Key: Search LOCAL cache first (fastest)
    const allLocalItems = itemsForCategory || [];
    const localMatch = allLocalItems.find(
      (item) => item.barcode === barcode || item.name === barcode,
    );

    if (localMatch) {
      handleAddToCart(localMatch);
      return;
    }

    // 2. Search GLOBAL SCAN CACHE (Fast - 0 Reads)
    const cachedItem = getFromScanCache(barcode);
    if (cachedItem) {
      handleAddToCart(cachedItem);
      return;
    }

    // 3. Search GLOBAL database
    try {
      const storeId = user?.storeId || "";
      const res = await authFetch(
        `/api/search-items?query=${encodeURIComponent(barcode)}&storeId=${storeId}`,
        {},
        idToken,
      );

      if (res.ok) {
        const results = await res.json();
        // Priority: Exact Barcode Match
        const exactMatch = results.find((i) => i.barcode === barcode);
        const match = exactMatch || results[0];

        if (match) {
          handleAddToCart(match);
          // Add to Global Cache for next time
          addToScanCache(barcode, match);
        } else {
          console.error(`Product not found: ${barcode}`);
        }
      } else {
        console.error("Scanner error");
      }
    } catch (err) {
      console.error("Scanner fetch error", err);
    }
  };

  useBarcodeScanner(handleScan, ["pos", "restaurants"].includes(user?.type));

  useEffect(() => {
    setIsSearching(searchQuery.trim().length > 0);
  }, [searchQuery]);

  // Hotel Mode: Ensure "rooms" category is fetched when in rooms mode
  useEffect(() => {
    if (posMode === "rooms") {
      // Always switch to rooms category when in rooms mode
      setActiveCategory("rooms");
    } else if (posMode === "restaurant" && activeCategory === "rooms") {
      // Reset to allow standard menu to pick first category
      setActiveCategory(null);
    }
  }, [posMode, activeCategory]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      {/* --- TOP BAR: SEARCH & LOGO --- */}
      <header className="z-30 flex items-center h-20 px-4 md:px-8 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="flex-1">
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            itemsByCategory={
              itemsForCategory ? { [activeCategory]: itemsForCategory } : {}
            }
            activeCategory={activeCategory}
            user={user}
            onSearchResult={(results) => setSearchResults(results)}
          />
        </div>
      </header>

      {/* --- DESKTOP/MOBILE DUAL MODE TOGGLE (HOTELS ONLY) --- */}
      {permissions.isDualModeUser && (
        <div className="flex justify-center bg-gray-50/50 dark:bg-gray-950/20 py-3 border-b dark:border-gray-800">
          <div className="flex p-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
            <button
              onClick={() => setPosMode("rooms")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                posMode === "rooms"
                  ? "bg-gray-900 dark:bg-brand-pink text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <FiHome size={14} strokeWidth={3} />
              Rooms
            </button>
            <button
              onClick={() => setPosMode("restaurant")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                posMode === "restaurant"
                  ? "bg-gray-900 dark:bg-brand-pink text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <FiCoffee size={14} strokeWidth={3} />
              Restaurant
            </button>
          </div>
        </div>
      )}

      {/* --- MOBILE CATEGORY BAR --- */}
      {(!permissions.isDualModeUser || posMode === "restaurant") && (
        <div className="lg:hidden bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-800 shadow-inner">
          <Menu
            active={activeCategory}
            onChange={setActiveCategory}
            isSearching={isSearching}
          />
        </div>
      )}

      <main className="flex flex-1 overflow-hidden relative">
        {/* --- DESKTOP CATEGORY SIDEBAR --- */}
        {(!permissions.isDualModeUser || posMode === "restaurant") && (
          <aside className="hidden lg:block w-72 overflow-y-auto border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
            <Menu
              active={activeCategory}
              onChange={setActiveCategory}
              isSearching={isSearching}
            />
          </aside>
        )}

        {/* --- PRODUCT GRID AREA --- */}
        <section className="flex-1 overflow-y-auto bg-white dark:bg-gray-900/20 custom-scrollbar">
          <div className="p-4 md:p-8">
            {/* Dynamic Heading based on Search or Category */}
            <div className="mb-6 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink mb-1">
                {isSearching ? "Search Results" : "Browsing Category"}
              </h2>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                {isSearching
                  ? `"${searchQuery}"`
                  : activeCategory || "Loading..."}
              </h1>
            </div>

            <PosScreen
              products={
                searchQuery
                  ? searchResults.filter((p) =>
                      posMode === "rooms"
                        ? p.category === "rooms"
                        : p.category !== "rooms",
                    )
                  : itemsForCategory || []
              }
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
            />
          </div>
        </section>

        {/* --- DESKTOP CHECKOUT SIDEBAR --- */}
        <aside className="hidden lg:block w-100">
          <Checkout
            cartItems={cartItems}
            subtotal={netSubtotal}
            gst={gst}
            total={total}
            setCartItems={setCartItems}
            showPrintModal={showPrintModal}
            setShowPrintModal={setShowPrintModal}
            saleId={saleId}
            setSaleId={setSaleId}
            globalDiscount={globalDiscount}
            setGlobalDiscount={setGlobalDiscount}
          />
        </aside>
      </main>

      {/* --- MOBILE FLOATING CART ACTION --- */}
      {cartItems.length > 0 && !isCheckoutOpen && (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 px-6 z-40 animate-in slide-in-from-bottom-4">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-gray-900 dark:bg-brand-pink text-white h-16 rounded-2xl shadow-2xl flex items-center justify-between px-6 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              </div>
              <span className="font-black uppercase tracking-widest text-sm">
                View Order
              </span>
            </div>
            <span className="text-lg font-black font-mono">
              Nu. {total.toLocaleString()}
            </span>
          </button>
        </div>
      )}

      {/* --- MOBILE CHECKOUT MODAL (FULL SCREEN) --- */}
      {isCheckoutOpen && (
        <div className="lg:hidden fixed inset-0 z-100 bg-white dark:bg-gray-950 animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col h-full">
            <header className="p-6 border-b dark:border-gray-800 flex items-center gap-4">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 -ml-2 text-gray-400"
              >
                <FiArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-black uppercase tracking-tight">
                Review Order
              </h2>
            </header>

            <div className="flex-1 overflow-y-auto">
              <Checkout
                cartItems={cartItems}
                subtotal={netSubtotal}
                gst={gst}
                total={total}
                setCartItems={setCartItems}
                showPrintModal={showPrintModal}
                setShowPrintModal={setShowPrintModal}
                saleId={saleId}
                setSaleId={setSaleId}
                globalDiscount={globalDiscount}
                setGlobalDiscount={setGlobalDiscount}
              />
            </div>
          </div>
        </div>
      )}
      {showPrintModal && (
        <PrintReceiptModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          saleId={saleId}
        />
      )}
      <KgModal
        isOpen={isKgModalOpen}
        onClose={() => {
          setIsKgModalOpen(false);
          setPendingWeightedItem(null);
        }}
        product={pendingWeightedItem}
        onConfirm={handleWeightConfirm}
      />
    </div>
  );
}

export default PosLayout;
