"use client";

import { useState, useRef, useEffect } from "react";
import { FiSearch, FiTruck, FiShoppingBag } from "react-icons/fi";
import Link from "next/link";
import useAuthStatus from "@/hooks/useAuthStatus";
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";

export default function GlobalPurchaseSearch() {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { idToken } = useAuthStatus();
  const { user } = useContext(UserContext);
  const storeId = user?.storeId;

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSearch = async (query) => {
    setValue(query);
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter" || !storeId) return;

    setLoading(true);
    setResults([]);

    try {
      const res = await fetch(
        `/api/search-purchases?query=${encodeURIComponent(value)}&storeId=${storeId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResults([]);
    setValue("");
  };

  return (
    <>
      {/* Mobile Backdrop: transparent overlay to capture outside clicks */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/5 md:hidden"
          onClick={handleClose}
        />
      )}

      <div className="w-full max-w-md relative z-50">
        {/* Mobile Trigger */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition md:hidden text-gray-500 dark:text-gray-400"
          >
            <FiSearch size={20} />
          </button>
        )}

        {/* Search Bar Container */}
        <div
          className={`${isOpen ? "block w-full" : "hidden md:block relative"}`}
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Bill # or Supplier..."
                value={value}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 py-3 pl-12 pr-10 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-pink transition"
              />

              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {isOpen && (
              <button
                onClick={handleClose}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 md:hidden whitespace-nowrap"
              >
                Close
              </button>
            )}
          </div>

          {/* Results Dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-[60vh] overflow-y-auto">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Purchase Results
                </p>
              </div>
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={handleClose}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-50 dark:border-gray-700 last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-50 text-purple-600 dark:bg-purple-900/20">
                    <FiTruck size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate uppercase">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.subtitle}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      Nu. {item.amount?.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      Recorded
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Results State */}
          {value && results.length === 0 && !loading && isOpen && (
            <div className="absolute top-full left-0 right-0 mt-4 md:hidden text-center p-8">
              <p className="text-xs text-gray-400">
                Press Enter for Bill #{value}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
