"use client";

import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  // Focus input when expanded
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="w-full max-w-md mx-auto mt-2 flex items-center justify-end relative">
      {/* Search Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition md:hidden"
        >
          <FiSearch size={20} />
        </button>
      )}

      {/* Expanded Search Input */}
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
            className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            py-3
            pl-10
            pr-10
            text-sm
            text-gray-700
            placeholder-gray-400
            outline-none
            shadow-lg
            transition
            relative
            z-40"
          />

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition z-50"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desktop version always visible */}
      <div className="hidden md:block flex-1">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products, customers..."
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              py-2.5
              pl-10
              pr-4
              text-sm
              text-gray-700
              placeholder-gray-400
              outline-none
              transition
              focus:border-amber-400
              focus:ring-2
              focus:ring-amber-300
            "
          />
        </div>
      </div>
    </div>
  );
}
