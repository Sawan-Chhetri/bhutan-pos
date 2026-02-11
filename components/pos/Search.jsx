// "use client";

// import { useState, useRef, useEffect } from "react";
// import { FiSearch } from "react-icons/fi";

// export default function Search({
//   value,
//   onChange,
//   itemsByCategory,
//   activeCategory,
//   onSearchResult,
//   user,
// }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const inputRef = useRef(null);
//   const storeId = user?.storeId || "";

//   useEffect(() => {
//     if (isOpen && inputRef.current) inputRef.current.focus();
//   }, [isOpen]);

//   const handleKeyDown = async (e) => {
//     if (e.key !== "Enter") return;

//     // 1️⃣ Check local cache first
//     const localItems = itemsByCategory[activeCategory] || [];
//     const filtered = localItems.filter((item) =>
//       item.name.toLowerCase().includes(value.toLowerCase())
//     );

//     if (filtered.length > 0) {
//       onSearchResult(filtered);
//       return;
//     }

//     // 2️⃣ If not found locally, fetch from DB
//     try {
//       const res = await // frontend
//       fetch(
//         `/api/search-items?query=${encodeURIComponent(
//           value
//         )}&storeId=${storeId}`
//       );

//       if (!res.ok) {
//         console.error("Search API error");
//         onSearchResult([]);
//         return;
//       }

//       const data = await res.json();
//       onSearchResult(data);
//     } catch (err) {
//       console.error("Search fetch error:", err);
//       onSearchResult([]);
//     }
//   };

//   return (
//     <div className="w-full max-w-md mx-auto mt-2 flex items-center justify-end relative">
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition md:hidden"
//         >
//           <FiSearch size={20} />
//         </button>
//       )}

//       {isOpen && (
//         <div className="relative flex-1 md:flex-1 block lg:hidden">
//           <FiSearch
//             className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//             size={18}
//           />
//           <input
//             ref={inputRef}
//             type="text"
//             placeholder="Search products, customers..."
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             onKeyDown={handleKeyDown}
//             className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 outline-none shadow-lg transition relative z-40"
//           />
//           {/* Close Button */}
//           <button
//             onClick={() => {
//               setIsOpen(false);
//               onChange("");
//             }}
//             className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition z-50"
//           >
//             ✕
//           </button>
//         </div>
//       )}

//       {/* Desktop */}
//       <div className="hidden md:block flex-1">
//         <div className="relative flex items-center">
//           <FiSearch className="absolute left-3 text-gray-400" size={18} />
//           <input
//             type="text"
//             placeholder="Search products, customers..."
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             onKeyDown={handleKeyDown}
//             className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-20 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus-ring-pink"
//           />
//           {/* Desktop Search Button */}
//           <button
//             onClick={(e) => handleKeyDown({ key: "Enter" })}
//             className="absolute right-2 btn-primary px-3 py-1 rounded-lg text-sm font-medium transition"
//           >
//             Search
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useRef, useEffect } from "react";
import { FiSearch, FiX, FiCommand } from "react-icons/fi";

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

    // Mobile UX: Blur to close keyboard
    inputRef.current?.blur();

    // 1️⃣ Check local cache first
    const categoryData = itemsByCategory[activeCategory];
    const localItems = Array.isArray(categoryData)
      ? categoryData
      : categoryData?.items || [];

    const filtered = localItems.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase()),
    );

    if (filtered.length > 0) {
      onSearchResult(filtered);
      return;
    }

    // 2️⃣ If not found locally, fetch from DB
    try {
      const res = await fetch(
        `/api/search-items?query=${encodeURIComponent(
          value,
        )}&storeId=${storeId}`,
      );

      if (!res.ok) {
        onSearchResult([]);
        return;
      }

      const data = await res.json();
      onSearchResult(data);
    } catch (err) {
      onSearchResult([]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex items-center justify-end relative px-2">
      {/* --- MOBILE SEARCH TRIGGER --- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 rounded-2xl bg-white dark:bg-gray-800 text-brand-pink shadow-lg border border-gray-100 dark:border-gray-700 md:hidden transition-transform active:scale-90"
        >
          <FiSearch size={22} strokeWidth={2.5} />
        </button>
      )}

      {/* --- MOBILE FULL-SCREEN SEARCH OVERLAY --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-md p-4 md:hidden animate-in fade-in duration-200">
          <div className="relative flex items-center w-full">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink"
              size={20}
              strokeWidth={3}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search catalog..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-2xl border-none bg-white py-5 pl-12 pr-14 text-base font-bold text-gray-900 shadow-2xl outline-none"
            />
            <button
              onClick={() => {
                setIsOpen(false);
                onChange("");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-100 rounded-full text-gray-500"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      )}

      {/* --- DESKTOP SEARCH BAR --- */}
      <div className="hidden md:block w-full group">
        <div className="relative flex items-center transition-all duration-300">
          {/* Left Icon with focus effect */}
          <div className="absolute left-4 text-gray-400 group-focus-within:text-brand-pink transition-colors">
            <FiSearch size={18} strokeWidth={2.5} />
          </div>

          <input
            type="text"
            placeholder="Search products, SKUs..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3.5 pl-12 pr-32 text-sm font-bold text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none transition-all focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 shadow-sm"
          />

          {/* Right Action Group */}
          <div className="absolute right-2 flex items-center gap-2">
            {value && (
              <button
                onClick={() => onChange("")}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX size={16} />
              </button>
            )}

            <button
              onClick={() => handleKeyDown({ key: "Enter" })}
              className="bg-gray-900 dark:bg-brand-pink text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              Search
            </button>
          </div>

          {/* Keyboard Hint (Aesthetic touch) */}
          {!value && (
            <div className="absolute right-24 pointer-events-none hidden lg:flex items-center gap-1 opacity-20">
              <FiCommand size={12} />
              <span className="text-[10px] font-bold">ENTER</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
