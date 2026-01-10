"use client";

import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";

export default function Search({
  value,
  onChange,
  itemsByCategory,
  activeCategory,
  onSearchResult,
  user,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const storeId = user?.storeId || "";

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return;

    // 1️⃣ Check local cache first
    const localItems = itemsByCategory[activeCategory] || [];
    const filtered = localItems.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );

    if (filtered.length > 0) {
      onSearchResult(filtered);
      return;
    }

    // 2️⃣ If not found locally, fetch from DB
    try {
      const res = await // frontend
      fetch(
        `/api/search-items?query=${encodeURIComponent(
          value
        )}&storeId=${storeId}`
      );

      if (!res.ok) {
        console.error("Search API error");
        onSearchResult([]);
        return;
      }

      const data = await res.json();
      onSearchResult(data);
    } catch (err) {
      console.error("Search fetch error:", err);
      onSearchResult([]);
    }
  };

  return (
    // <div className="w-full max-w-md mx-auto mt-2 flex items-center justify-end relative">
    //   {!isOpen && (
    //     <button
    //       onClick={() => setIsOpen(true)}
    //       className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition md:hidden"
    //     >
    //       <FiSearch size={20} />
    //     </button>
    //   )}

    //   {isOpen && (
    //     <div className="relative flex-1 md:flex-1 block lg:hidden">
    //       <FiSearch
    //         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    //         size={18}
    //       />
    //       <input
    //         ref={inputRef}
    //         type="text"
    //         placeholder="Search products, customers..."
    //         value={value}
    //         onChange={(e) => onChange(e.target.value)}
    //         onKeyDown={handleKeyDown}
    //         className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 outline-none shadow-lg transition relative z-40"
    //       />
    //       <button
    //         onClick={() => {
    //           setIsOpen(false);
    //           onChange("");
    //         }}
    //         className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition z-50"
    //       >
    //         ✕
    //       </button>
    //     </div>
    //   )}

    //   {/* Desktop */}
    //   <div className="hidden md:block flex-1">
    //     <div className="relative flex items-center">
    //       <FiSearch className="absolute left-3 text-gray-400" size={18} />
    //       <input
    //         type="text"
    //         placeholder="Search products, customers..."
    //         value={value}
    //         onChange={(e) => onChange(e.target.value)}
    //         onKeyDown={handleKeyDown}
    //         className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
    //       />
    //     </div>
    //   </div>
    // </div>
    <div className="w-full max-w-md mx-auto mt-2 flex items-center justify-end relative">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition md:hidden"
        >
          <FiSearch size={20} />
        </button>
      )}

      {isOpen && (
        <div className="relative flex-1 md:flex-1 block lg:hidden">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, customers..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 outline-none shadow-lg transition relative z-40"
          />
          {/* Close Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              onChange("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition z-50"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden md:block flex-1">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products, customers..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-20 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
          />
          {/* Desktop Search Button */}
          <button
            onClick={(e) => handleKeyDown({ key: "Enter" })}
            className="absolute right-2 bg-amber-400 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-amber-500 transition"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
