"use client";

import {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import {
  syncInventory,
  getLocalItemsByCategory,
  getLocalItemByBarcode,
} from "@/lib/inventorySync";

const bhutanGST = 0.05;

function PosLayout() {
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { idToken } = useAuthStatus(); // <--- Added this line
  const permissions = usePermissions(user);

  // Background Sync for Offline Search
  useEffect(() => {
    if (user?.storeId && idToken) {
      syncInventory(idToken, user.storeId)
        .then((count) => {
          if (count > 0)
            toast.success("Offline Mode Ready", { autoClose: 2000 });
        })
        .catch((err) => console.warn("Inventory sync failed silently", err));
    }
  }, [user?.storeId, idToken]);

  // Dual-Mode State for Hotels
  const [posMode, setPosMode] = useState(
    permissions.isHotelUser ? "rooms" : "restaurant",
  );

  // Replaced useSWR with manual state for infinite scroll
  const [itemsByCategory, setItemsByCategory] = useState({});
  const itemsByCategoryRef = useRef(itemsByCategory);
  useEffect(() => {
    itemsByCategoryRef.current = itemsByCategory;
  }, [itemsByCategory]);

  const displayedCategoryData = activeCategory
    ? itemsByCategory[activeCategory]
    : null;
  const itemsForCategory = displayedCategoryData?.items || [];
  const hasMore = displayedCategoryData?.hasMore || false;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  // Search Pagination State
  const [searchCursor, setSearchCursor] = useState(null); // Last Visible Name
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(false);

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
   * ⚡ ULTRA-FAST BARCODE INDEX (O(1) Lookup)
   * --------------------------------------------- */
  // Create a Map of all loaded products by barcode for instant access
  // This ensures checking 5000 items is instant, vs looping an array.
  const globalBarcodeMap = useMemo(() => {
    const map = new Map();
    // Iterate over every category currently in memory
    Object.values(itemsByCategory).forEach((categoryData) => {
      if (Array.isArray(categoryData?.items)) {
        categoryData.items.forEach((item) => {
          if (item.barcode) {
            map.set(item.barcode, item);
          }
        });
      }
    });
    return map;
  }, [itemsByCategory]);

  /* ---------------------------------------------
   * 🛒 BARCODE SCANNER LOGIC
   * --------------------------------------------- */
  const handleScan = async (barcode) => {
    if (!barcode) return;

    // 1. O(1) Memory Lookup: Check ALL loaded categories instantly
    // We check the map instead of looping the current category array
    if (globalBarcodeMap.has(barcode)) {
      console.log(`[Scanner] ✅ Found in Memory Map`);
      handleAddToCart(globalBarcodeMap.get(barcode));
      return;
    }

    // 2. Search GLOBAL SCAN CACHE (Fast - 0 Reads)
    const cachedItem = getFromScanCache(barcode);
    if (cachedItem) {
      console.log(`[Scanner] ✅ Found in Scan Cache`);
      handleAddToCart(cachedItem);
      return;
    }

    // 2.5 Search Local IndexedDB (Offline-Ready / Zero Cost)
    try {
      const localMatch = await getLocalItemByBarcode(user?.storeId, barcode);

      // Found locally
      if (localMatch) {
        console.log(`[Scanner] ✅ Found in IndexedDB`);
        handleAddToCart(localMatch);
        addToScanCache(barcode, localMatch);
        return;
      }

      // DB was active but item not found (Strictly Local Mode)
      // We trust the local DB if it's populated.
      if (localMatch === false) {
        console.log(`[Scanner] ❌ Not found in IndexedDB (DB Active)`);
        console.error(`Product not found locally: ${barcode}`);
        toast.error(`Product not found: ${barcode}`);
        return;
      }

      // If localMatch === null, DB is empty, proceed to API fallback below...
    } catch (e) {
      console.warn("Local barcode check failed", e);
    }

    // 3. Search GLOBAL database (Fallback for fresh devices)
    console.log(`[Scanner] 🌐 Falling back to API search`);
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

  // Unified fetcher for Initial Load & Load More
  const fetchCategoryData = useCallback(
    async (isInitial = true) => {
      if (!activeCategory || !idToken) return;

      console.log(`[PosLayout] Fetching data for category: ${activeCategory}`);

      // 1️⃣ Try Local IndexedDB First (Fastest, Offline-Ready)
      try {
        const localItems = await getLocalItemsByCategory(
          user?.storeId,
          activeCategory,
        );

        // If we have data (or confirm empty category), use it and skip API
        if (localItems !== null) {
          console.log(
            `[PosLayout] ✅ Loaded ${localItems.length} items from IndexedDB for ${activeCategory}`,
          );
          setItemsByCategory((prev) => ({
            ...prev,
            [activeCategory]: {
              items: localItems,
              hasMore: false, // Local DB loads all items at once
              timestamp: Date.now(),
            },
          }));
          return;
        } else {
          console.log(
            `[PosLayout] ⚠️ Local DB returned null (empty/unsynced). Falling back to API.`,
          );
        }
      } catch (err) {
        console.warn("Local fetch failed, falling back to API", err);
      }

      // 2️⃣ Fallback: API Fetch (Legacy/Safety Net)
      console.log(`[PosLayout] 🌐 Fetching from API: ${activeCategory}`);
      let currentData = itemsByCategoryRef.current[activeCategory];
      currentData = currentData || { items: [] };

      // Prevent fetching if we are loading more but there's nothing more
      if (!isInitial && !currentData.nextCursor) return;

      try {
        if (!isInitial) setIsLoadingMore(true);

        const urlStart = isInitial ? "Initial Fetch" : "Load More";

        let url = `/api/readItemsByCategory?category=${encodeURIComponent(activeCategory)}&limit=15`;

        // If Initial: Check timestamp
        if (isInitial && currentData.timestamp) {
          url += `&ts=${currentData.timestamp}`;
        }

        // If Load More: Add cursor
        if (!isInitial && currentData.nextCursor) {
          url += `&startAfterName=${encodeURIComponent(currentData.nextCursor.name)}&startAfterId=${currentData.nextCursor.id}`;
        }

        const res = await authFetch(url, {}, idToken);

        if (!res.ok) {
          setIsLoadingMore(false);
          return;
        }

        const data = await res.json();

        // Case 1: Not Modified (Server says our cache is good)
        // Only happens on initial load check
        if (data.notModified) {
          setIsLoadingMore(false);
          return;
        }

        // Case 2: New Data (Either fresh load, or appended)
        setItemsByCategory((prev) => {
          const prevData = prev[activeCategory] || { items: [] };

          let newItems;
          if (isInitial) {
            newItems = data.items;
          } else {
            // Append (Filter out duplicates to avoid React key errors)
            const existingIds = new Set(prevData.items.map((i) => i.id));
            const uniqueNewItems = data.items.filter(
              (i) => !existingIds.has(i.id),
            );
            newItems = [...prevData.items, ...uniqueNewItems];
          }

          const newStateData = {
            items: newItems,
            timestamp: data.timestamp,
            nextCursor: data.nextCursor,
            hasMore: data.hasMore,
          };

          return {
            ...prev,
            [activeCategory]: newStateData,
          };
        });
      } catch (err) {
        console.error("Fetch items error:", err);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [activeCategory, idToken, user?.storeId],
  );

  // Effect: Fetch when category changes (Initial Load)
  useEffect(() => {
    fetchCategoryData(true);
  }, [fetchCategoryData]);

  // --- SEARCH HANDLER (LAZY LOADING) ---
  const fetchSearchResults = async (query, isInitial = false) => {
    if (!query) return;

    try {
      setIsLoadingMore(true);
      const storeId = user?.storeId || "";
      let url = `/api/search-items?query=${encodeURIComponent(query)}&storeId=${storeId}&limit=10`;

      // Use the *last result's* name as the cursor for the next page
      if (!isInitial && searchCursor) {
        url += `&lastVisibleName=${encodeURIComponent(searchCursor)}`;
      }

      const res = await authFetch(url, {}, idToken);
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();

      if (data.length < 10) {
        setHasMoreSearchResults(false);
      } else {
        setHasMoreSearchResults(true);
      }

      if (data.length > 0) {
        // Update Cursor (Last item name)
        setSearchCursor(data[data.length - 1].name);

        setSearchResults((prev) => (isInitial ? data : [...prev, ...data]));
      } else {
        if (isInitial) setSearchResults([]);
      }
    } catch (e) {
      console.error("Search Error", e);
      setHasMoreSearchResults(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSearchSubmit = async (query) => {
    if (!query) {
      setSearchResults([]);
      setSearchCursor(null);
      setHasMoreSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchCursor(null); // Reset cursor
    setHasMoreSearchResults(true); // Assume data exists initially

    await fetchSearchResults(query, true);
  };

  const handleLoadMore = () => {
    if (isLoadingMore) return;

    if (searchQuery) {
      // If searching
      if (hasMoreSearchResults) fetchSearchResults(searchQuery, false);
    } else {
      // If browsing category
      if (hasMore) fetchCategoryData(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      {/* --- TOP BAR: SEARCH & LOGO --- */}
      <header className="z-30 flex items-center h-20 px-4 md:px-8 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="flex-1">
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit} // Pass the handler!
            itemsByCategory={
              itemsForCategory ? { [activeCategory]: itemsForCategory } : {}
            }
            activeCategory={activeCategory}
            user={user}
            // onSearchResult={(results) => setSearchResults(results)} <-- REMOVED OLD PROP
            onSearchResult={(results) => {
              setSearchResults(results);
              // If finding local/cached results, disable pagination fetch
              setSearchCursor(null);
              setHasMoreSearchResults(false);
              setIsSearching(true);
            }}
            globalBarcodeMap={globalBarcodeMap}
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
            storeId={user?.storeId}
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
              storeId={user?.storeId}
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
                isSearching
                  ? searchResults.filter((p) =>
                      posMode === "rooms"
                        ? p.category === "rooms"
                        : p.category !== "rooms",
                    )
                  : itemsForCategory || []
              }
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              onLoadMore={handleLoadMore}
              hasMore={isSearching ? hasMoreSearchResults : hasMore} // Dynamically check
              isLoadingMore={isLoadingMore}
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
            onSimulateScan={handleScan} // <--- Added prop for testing
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
                onSimulateScan={handleScan} // <--- Added prop for testing
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
