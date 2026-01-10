"use client";

import { useEffect, useState, useContext } from "react";
import Search from "@/components/pos/Search";
import Menu from "@/components/pos/Menu";
import Checkout from "@/components/pos/Checkout";
import PosScreen from "@/components/pos/PosScreen";
import { UserContext } from "@/contexts/UserContext";
import useAuthStatus from "@/hooks/useAuthStatus";

const bhutanGST = 0.05; // 5% GST

function PosLayout() {
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(); // will be set by Menu
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { idToken } = useAuthStatus();
  const { user } = useContext(UserContext);

  const [itemsByCategory, setItemsByCategory] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Display items for active category
  const displayedProducts = activeCategory
    ? itemsByCategory[activeCategory] || []
    : [];

  // Add to cart
  const handleAddToCart = (product) => {
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          unitPrice: product.price,
          qty: 1,
          isGSTExempt: product.isGSTExempt || false,
        },
      ]);
    }
  };

  // Totals
  // Subtotal for all items (same as before)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );

  // GST only on items that are not GST exempt
  const gst = cartItems.reduce((sum, item) => {
    if (item.isGSTExempt) return sum; // skip exempt items
    return sum + item.qty * item.unitPrice * bhutanGST;
  }, 0);

  // Total = subtotal + GST
  const total = subtotal + gst;

  // Fetch items for the active category if not already fetched
  useEffect(() => {
    if (!activeCategory || !idToken) return;
    if (itemsByCategory[activeCategory]) return; // already fetched

    const fetchItemsForCategory = async () => {
      try {
        const res = await fetch(
          `/api/readItemsByCategory?category=${encodeURIComponent(
            activeCategory
          )}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setItemsByCategory((prev) => ({
          ...prev,
          [activeCategory]: data,
        }));
      } catch (err) {
        console.error("Fetch items error:", err);
      }
    };

    fetchItemsForCategory();
  }, [activeCategory, idToken, itemsByCategory]);

  // Update when searchQuery changes
  useEffect(() => {
    setIsSearching(searchQuery.trim().length > 0);
  }, [searchQuery]);

  return (
    <div className="h-screen flex flex-col dark:bg-gray-900 dark:text-white">
      {/* Search */}
      <div className="p-4 border-b dark:border-gray-700">
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          itemsByCategory={itemsByCategory}
          activeCategory={activeCategory}
          user={user}
          onSearchResult={(results) => {
            setSearchResults(results);
          }}
        />
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden p-2 border-b overflow-x-auto flex gap-2 dark:border-gray-700">
        <Menu active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Menu */}
        <div className="hidden lg:block border-r w-48 p-4 dark:border-gray-700">
          <Menu
            active={activeCategory}
            onChange={setActiveCategory}
            isSearching={isSearching}
          />
        </div>

        {/* POS Screen */}
        <div className="flex-1 overflow-y-auto">
          <PosScreen
            products={
              searchQuery
                ? searchResults
                : itemsByCategory[activeCategory] || []
            }
            // products={displayedProducts}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Desktop Checkout */}
        <div className="hidden lg:block w-96 border-l dark:border-gray-700">
          <Checkout
            cartItems={cartItems}
            subtotal={subtotal}
            gst={gst}
            total={total}
            setCartItems={setCartItems}
          />
        </div>
      </div>

      {/* Mobile Checkout Button */}
      <button
        onClick={() => setIsCheckoutOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 right-4 bg-amber-400 text-white font-semibold py-3 rounded-xl shadow-lg flex justify-center items-center gap-2"
      >
        View Cart
        <span className="bg-white text-black rounded-full px-2 py-1 text-xs font-bold">
          {cartItems.length}
        </span>
      </button>

      {/* Mobile Checkout Modal */}
      {isCheckoutOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40">
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl h-[85%] flex flex-col animate-slideUp">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 border-b flex justify-between items-center dark:border-gray-700">
              <h2 className="font-semibold text-lg">Checkout</h2>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-gray-500 dark:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Checkout
                cartItems={cartItems}
                subtotal={subtotal}
                gst={gst}
                total={total}
                setCartItems={setCartItems}
                hidePayButton
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PosLayout;
