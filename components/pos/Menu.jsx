// "use client";

// import { useEffect, useState } from "react";
// import useAuthStatus from "@/hooks/useAuthStatus";

// export default function Menu({ active, onChange, isSearching }) {
//   const [categories, setCategories] = useState([]);
//   const { idToken } = useAuthStatus();

//   useEffect(() => {
//     const fetchCategories = async () => {
//       if (!idToken) return;
//       try {
//         const res = await (
//           await import("@/lib/authFetch")
//         ).default("/api/categories", {}, idToken);

//         if (!res.ok) {
//           setCategories([]);
//           return;
//         }

//         const data = await res.json(); // [{ id, name }, ...]
//         setCategories(data);

//         // Automatically select first category if none active
//         if (data.length > 0 && !active) {
//           onChange(data[0].name);
//         }
//       } catch (err) {
//         console.error("Fetch categories error:", err);
//         setCategories([]);
//       }
//     };

//     fetchCategories();
//   }, [idToken, onChange, active]);

//   return (
//     <>
//       {/* Mobile: horizontal scroll, single-line */}
//       <div className="lg:hidden flex gap-2 overflow-x-auto px-2">
//         {categories.map((category) => (
//           <button
//             key={category.id}
//             onClick={() => onChange(category.name)}
//             className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer
//               ${
//                 !isSearching && active === category.name
//                   ? "bg-brand-pink text-white"
//                   : "bg-gray-100 text-gray-700 hover:product-hover dark:bg-gray-700 dark:text-gray-200"
//               }`}
//             title={category.name} // full name on tap/hover
//           >
//             {category.name.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {/* Desktop: vertical, multi-line with clamp */}
//       <div className="hidden lg:flex lg:flex-col gap-2 overflow-y-auto">
//         {categories.map((category) => (
//           <button
//             key={category.id}
//             onClick={() => onChange(category.name)}
//             className={`rounded-lg px-4 py-2 text-sm font-medium text-left transition cursor-pointer
//               ${
//                 !isSearching && active === category.name
//                   ? "bg-brand-pink text-white"
//                   : "bg-gray-100 text-gray-700 hover:product-hover dark:bg-gray-700 dark:text-gray-200"
//               }
//               line-clamp-3
//             `}
//             title={category.name} // show full name on hover
//           >
//             {category.name}
//           </button>
//         ))}
//       </div>
//     </>
//   );
// }

"use client";
import { useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { FiLayers, FiChevronRight } from "react-icons/fi";

export default function Menu({ active, onChange, isSearching }) {
  const {
    data: categories,
    error,
    isLoading,
  } = useSWR("/api/categories", fetcher);

  useEffect(() => {
    if (categories && categories.length > 0 && !active) {
      const filteredCategories = categories.filter(
        (cat) => cat.name !== "rooms",
      );
      if (filteredCategories.length > 0) {
        onChange(filteredCategories[0].name);
      }
    }
  }, [categories, active, onChange]);

  const filteredCategories =
    categories?.filter((cat) => cat.name !== "rooms") || [];

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-8 bg-gray-200 rounded-md dark:bg-gray-700"></div>
          <div className="h-8 bg-gray-200 rounded-md dark:bg-gray-700"></div>
          <div className="h-8 bg-gray-200 rounded-md dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-xs font-bold">
        Error loading categories.
      </div>
    );
  }

  return (
    <nav className="w-full">
      {/* --- MOBILE: Elegant Scrollable Pills --- */}
      <div className="lg:hidden flex items-center gap-3 overflow-x-auto px-6 py-4 no-scrollbar">
        {filteredCategories.map((category) => {
          const isActive = !isSearching && active === category.name;
          return (
            <button
              key={category.id}
              onClick={() => onChange(category.name)}
              className={`whitespace-nowrap shrink-0 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 border
                ${
                  isActive
                    ? "bg-brand-pink text-white border-brand-pink shadow-lg shadow-pink-500/30 -translate-y-0.5"
                    : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:text-brand-pink hover:border-brand-pink/40"
                }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* --- DESKTOP: Architectural Sidebar --- */}
      <div className="hidden lg:flex lg:flex-col  py-6 overflow-y-auto h-full">
        {/* Section Header */}
        <div className="flex items-left gap-3 px-4 mb-6">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Categories
          </span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
        </div>

        {filteredCategories.map((category) => {
          const isActive = !isSearching && active === category.name;
          return (
            <button
              key={category.id}
              onClick={() => onChange(category.name)}
              className={`relative group flex items-left justify-betweeen rounded-xl px-4 py-3.5 transition-all duration-300
                ${
                  isActive
                    ? "bg-white dark:bg-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none"
                    : "hover:bg-gray-100/50 dark:hover:bg-gray-800/40"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isActive
                      ? "bg-brand-pink text-white"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-400 group-hover:text-brand-pink"
                  }`}
                >
                  <FiLayers size={16} />
                </div>

                <span
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300
                  ${
                    isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                  }
                `}
                >
                  {category.name}
                </span>
              </div>
              <FiChevronRight
                className={`transition-all duration-300 ${
                  isActive
                    ? "text-brand-pink opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 text-gray-300"
                }`}
                size={16}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
