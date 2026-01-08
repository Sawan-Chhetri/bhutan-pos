"use client";

import { useState } from "react";
import Search from "@/components/pos/Search";
import Menu from "@/components/pos/Menu";
import Checkout from "@/components/pos/Checkout";
import PosScreen from "@/components/pos/PosScreen";

const bhutanGST = 0.05; // 5% GST

const products = [
  {
    id: 1,
    name: "Veg Pasta",
    price: 180,
    category: "Pasta",
  },
  {
    id: 2,
    name: "Egg Sandwich",
    price: 120,
    category: "Eggs",
    image: "/images/sandwich.jpg",
  },
  {
    id: 3,
    name: "Cold Coffee",
    price: 90,
    category: "Drinks",
    image: "/images/coffee.jpg",
  },
  {
    id: 4,
    name: "Burger",
    price: 150,
    category: "Food",
    image: "/images/burger.jpg",
  },
  {
    id: 5,
    name: "French Fries",
    price: 80,
    category: "Snacks",
    image: "/images/fries.jpg",
  },
  {
    id: 6,
    name: "French Toast",
    price: 80,
    category: "Snacks",
    image: "/images/fries.jpg",
  },
  {
    id: 7,
    name: "Cupcake",
    price: 80,
    category: "Snacks",
    image: "/images/fries.jpg",
  },
];

function PosLayout() {
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Filter products by category
  const displayedProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Add to cart logic
  const handleAddToCart = (product) => {
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCartItems((prev) => [...prev, { ...product, qty: 1 }]);
    }
  };

  // Totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );
  const gst = subtotal * bhutanGST;
  const total = subtotal + gst;

  return (
    <div className="h-screen flex flex-col dark:bg-gray-900 dark:text-white">
      {/* Search */}
      <div className="p-4 border-b dark:border-gray-700">
        <Search />
      </div>

      {/* Mobile Menu (horizontal) */}
      <div className="lg:hidden p-2 border-b overflow-x-auto flex gap-2 dark:border-gray-700">
        <Menu active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Menu (desktop only) */}
        <div className="hidden lg:block border-r w-48 p-4 dark:border-gray-700">
          <Menu active={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* POS Screen */}
        <div className="flex-1 overflow-y-auto">
          <PosScreen
            products={displayedProducts}
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
            {/* 🔒 Fixed Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 border-b flex justify-between items-center dark:border-gray-700">
              <h2 className="font-semibold text-lg">Checkout</h2>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-gray-500 dark:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>

            {/* 📜 Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <Checkout
                cartItems={cartItems}
                subtotal={subtotal}
                gst={gst}
                total={total}
                setCartItems={setCartItems}
                hidePayButton // 👈 optional prop
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PosLayout;
