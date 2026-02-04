// // "use client";
// // import { useEffect, useState } from "react";
// // import { FiEdit, FiTrash2 } from "react-icons/fi";
// // import AddItemModal from "./AddItemModal";
// // import DeleteModal from "./DeleteModal";
// // import useAuthStatus from "@/hooks/useAuthStatus";
// // import authFetch from "@/lib/authFetch";

// // const ITEMS_PER_PAGE = 20;

// // export default function ItemScreen() {
// //   const { user, idToken } = useAuthStatus();

// //   const [items, setItems] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [totalPages, setTotalPages] = useState(1);

// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [editingItem, setEditingItem] = useState(null);
// //   const [deleteItem, setDeleteItem] = useState(null);

// //   /* --------------------------------
// //    * FETCH ITEMS (PAGINATED)
// //    * -------------------------------- */
// //   useEffect(() => {
// //     if (!user || !idToken) return;

// //     const fetchItems = async () => {
// //       setLoading(true);
// //       try {
// //         const res = await authFetch(
// //           `/api/read-items?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
// //           {},
// //           idToken
// //         );

// //         if (!res.ok) throw new Error("Failed to fetch items");

// //         const data = await res.json();
// //         setItems(data.items);
// //         setTotalPages(Math.ceil(data.totalCount / ITEMS_PER_PAGE));
// //       } catch (err) {
// //         console.error("Fetch items error:", err);
// //         setItems([]);
// //         setTotalPages(1);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchItems();
// //   }, [user, idToken, currentPage]);

// //   /* --------------------------------
// //    * MODAL HELPERS
// //    * -------------------------------- */
// //   const onClose = () => {
// //     setIsModalOpen(false);
// //     setEditingItem(null);
// //   };

// //   const handleUpdateItem = (updatedItem) => {
// //     setItems((prev) =>
// //       prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
// //     );
// //     onClose();
// //   };

// //   const confirmDelete = async (itemId) => {
// //     setDeleteItem(null);
// //     setItems((prev) => prev.filter((i) => i.id !== itemId));

// //     try {
// //       await authFetch(
// //         `/api/modify-items/${itemId}`,
// //         { method: "DELETE" },
// //         idToken
// //       );
// //     } catch (err) {
// //       console.error("Delete failed", err);
// //     }
// //   };

// //   /* --------------------------------
// //    * UI STATES
// //    * -------------------------------- */
// //   if (loading) {
// //     return (
// //       <div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-300">
// //         Loading items...
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
// //       {/* Top Bar */}
// //       <div className="relative mb-6 flex items-center">
// //         <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-900 dark:text-white">
// //           Items
// //         </h1>

// //         <div className="ml-auto">
// //           <button
// //             onClick={() => setIsModalOpen(true)}
// //             className="btn-primary px-4 py-2 font-semibold"
// //           >
// //             Add Item +
// //           </button>
// //         </div>
// //       </div>

// //       {/* Items Grid */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
// //         {items.map((item) => (
// //           <div
// //             key={item.id}
// //             className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 relative"
// //           >
// //             {/* Actions */}
// //             <div className="absolute top-3 right-3 flex gap-2">
// //               <button
// //                 onClick={() => {
// //                   setEditingItem(item);
// //                   setIsModalOpen(true);
// //                 }}
// //                 className="text-gray-400 hover:text-brand-pink transition"
// //               >
// //                 <FiEdit size={16} />
// //               </button>

// //               <button
// //                 onClick={() => setDeleteItem(item)}
// //                 className="text-gray-400 hover:text-red-500 transition"
// //               >
// //                 <FiTrash2 size={16} />
// //               </button>
// //             </div>

// //             <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
// //               {item.name}
// //             </p>
// //             <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
// //               Category: {item.category}
// //             </p>
// //             <p className="mt-2 font-medium text-gray-900 dark:text-white">
// //               Nu. {item.price}
// //             </p>
// //           </div>
// //         ))}
// //       </div>

// //       {/* Pagination */}
// //       <div className="mt-6 flex justify-center flex-wrap gap-2">
// //         {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
// //           <button
// //             key={page}
// //             onClick={() => setCurrentPage(page)}
// //             className={`px-3 py-1 rounded-full border transition ${
// //               page === currentPage
// //                 ? "bg-brand-pink text-white border-brand-pink"
// //                 : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
// //             }`}
// //           >
// //             {page}
// //           </button>
// //         ))}
// //       </div>

// //       {/* Modals */}
// //       <AddItemModal
// //         isOpen={isModalOpen}
// //         onClose={onClose}
// //         editingItem={editingItem}
// //         onAddItem={(newItem) => setItems((prev) => [newItem, ...prev])}
// //         onUpdateItem={handleUpdateItem}
// //         idToken={idToken}
// //       />

// //       <DeleteModal
// //         deleteItem={deleteItem}
// //         isOpen={!!deleteItem}
// //         onClose={() => setDeleteItem(null)}
// //         onConfirm={confirmDelete}
// //         title="Delete Item"
// //         message={`Are you sure you want to delete "${deleteItem?.name}"?`}
// //       />
// //     </div>
// //   );
// // }

// "use client";
// import { useEffect, useState } from "react";
// import {
//   FiEdit,
//   FiTrash2,
//   FiPlus,
//   FiTag,
//   FiArchive,
//   FiGrid,
//   FiList,
//   FiSearch,
//   FiChevronLeft,
//   FiChevronRight,
// } from "react-icons/fi";
// import AddItemModal from "./AddItemModal";
// import DeleteModal from "./DeleteModal";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import authFetch from "@/lib/authFetch";

// const ITEMS_PER_PAGE = 20;

// export default function ItemScreen() {
//   const { user, idToken } = useAuthStatus();
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'

//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [deleteItem, setDeleteItem] = useState(null);

//   useEffect(() => {
//     if (!user || !idToken) return;
//     const fetchItems = async () => {
//       setLoading(true);
//       try {
//         const res = await authFetch(
//           `/api/read-items?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
//           {},
//           idToken
//         );
//         if (!res.ok) throw new Error("Failed to fetch items");
//         const data = await res.json();
//         setItems(data.items);
//         setTotalPages(Math.ceil(data.totalCount / ITEMS_PER_PAGE));
//       } catch (err) {
//         console.error("Fetch items error:", err);
//         setItems([]);
//         setTotalPages(1);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchItems();
//   }, [user, idToken, currentPage]);

//   const onClose = () => {
//     setIsModalOpen(false);
//     setEditingItem(null);
//   };

//   const handleUpdateItem = (updatedItem) => {
//     setItems((prev) =>
//       prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
//     );
//     onClose();
//   };

//   const confirmDelete = async (itemId) => {
//     setDeleteItem(null);
//     setItems((prev) => prev.filter((i) => i.id !== itemId));
//     try {
//       await authFetch(
//         `/api/modify-items/${itemId}`,
//         { method: "DELETE" },
//         idToken
//       );
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-pink mb-4"></div>
//         <p className="text-gray-500 animate-pulse">Loading Inventory...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
//       {/* --- HEADER SECTION --- */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
//             <FiArchive className="text-brand-pink" /> Inventory Management
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Total Products: {items.length} on this page
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* View Switcher */}
//           <div className="hidden md:flex bg-gray-200 dark:bg-gray-800 p-1 rounded-lg mr-2">
//             <button
//               onClick={() => setViewMode("grid")}
//               className={`p-2 rounded-md transition ${
//                 viewMode === "grid"
//                   ? "bg-white dark:bg-gray-700 shadow-sm text-brand-pink"
//                   : "text-gray-500"
//               }`}
//             >
//               <FiGrid size={18} />
//             </button>
//             <button
//               onClick={() => setViewMode("table")}
//               className={`p-2 rounded-md transition ${
//                 viewMode === "table"
//                   ? "bg-white dark:bg-gray-700 shadow-sm text-brand-pink"
//                   : "text-gray-500"
//               }`}
//             >
//               <FiList size={18} />
//             </button>
//           </div>

//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="flex items-center gap-2 bg-brand-pink hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-pink-500/20"
//           >
//             <FiPlus strokeWidth={3} /> Add Item
//           </button>
//         </div>
//       </div>

//       {/* --- CONTENT SECTION --- */}
//       {viewMode === "grid" ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//           {items.map((item) => (
//             <div
//               key={item.id}
//               className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all overflow-hidden"
//             >
//               <div className="p-5">
//                 <div className="flex justify-between items-start mb-3">
//                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
//                     <FiTag size={10} /> {item.category}
//                   </span>
//                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                     <button
//                       onClick={() => {
//                         setEditingItem(item);
//                         setIsModalOpen(true);
//                       }}
//                       className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
//                     >
//                       <FiEdit size={16} />
//                     </button>
//                     <button
//                       onClick={() => setDeleteItem(item)}
//                       className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
//                     >
//                       <FiTrash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//                 <div className="min-h-16">
//                   <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2 uppercase">
//                     {item.name}
//                   </h3>
//                 </div>
//                 <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-end">
//                   <div>
//                     <p className="text-[10px] text-gray-400 font-bold uppercase">
//                       Price
//                     </p>
//                     <p className="text-lg font-black text-gray-900 dark:text-white">
//                       Nu. {item.price}
//                     </p>
//                   </div>
//                   <span className="text-[10px] text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full uppercase">
//                     In Stock
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         /* TABLE VIEW */
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
//           <table className="w-full min-w-150 text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
//                 <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-500 tracking-wider">
//                   Product Info
//                 </th>
//                 <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-500 tracking-wider">
//                   Category
//                 </th>
//                 <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-500 tracking-wider">
//                   Price
//                 </th>
//                 <th className="px-6 py-4 text-right text-[11px] font-bold uppercase text-gray-500 tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
//               {items.map((item) => (
//                 <tr
//                   key={item.id}
//                   className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
//                 >
//                   <td className="px-6 py-4">
//                     <p className="font-bold text-gray-800 dark:text-gray-100 uppercase text-sm leading-tight">
//                       {item.name}
//                     </p>
//                     <p className="text-[10px] text-gray-400 mt-0.5">
//                       ID: {item.id.slice(-8).toUpperCase()}
//                     </p>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded capitalize">
//                       {item.category}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
//                     Nu. {item.price}
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     <div className="flex justify-end gap-2">
//                       <button
//                         onClick={() => {
//                           setEditingItem(item);
//                           setIsModalOpen(true);
//                         }}
//                         className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
//                       >
//                         <FiEdit size={16} />
//                       </button>
//                       <button
//                         onClick={() => setDeleteItem(item)}
//                         className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
//                       >
//                         <FiTrash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* --- PAGINATION --- */}
//       <div className="mt-8 flex items-center justify-center gap-4">
//         <button
//           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           disabled={currentPage === 1}
//           className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition"
//         >
//           <FiChevronLeft />
//         </button>

//         <div className="flex gap-2">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => setCurrentPage(page)}
//               className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
//                 page === currentPage
//                   ? "bg-brand-pink text-white shadow-md shadow-pink-500/20"
//                   : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:border-brand-pink"
//               }`}
//             >
//               {page}
//             </button>
//           ))}
//         </div>

//         <button
//           onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//           disabled={currentPage === totalPages}
//           className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition"
//         >
//           <FiChevronRight />
//         </button>
//       </div>

//       {/* Modals */}
//       <AddItemModal
//         isOpen={isModalOpen}
//         onClose={onClose}
//         editingItem={editingItem}
//         onAddItem={(newItem) => setItems((prev) => [newItem, ...prev])}
//         onUpdateItem={handleUpdateItem}
//         idToken={idToken}
//       />
//       <DeleteModal
//         deleteItem={deleteItem}
//         isOpen={!!deleteItem}
//         onClose={() => setDeleteItem(null)}
//         onConfirm={confirmDelete}
//         title="Delete Item"
//         message={`Are you sure you want to delete "${deleteItem?.name}"?`}
//       />
//     </div>
//   );
// }

"use client";
import { useContext, useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiPlus, FiTag, FiArchive, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiSearch, FiX } from "react-icons/fi";
import AddItemModal from "./AddItemModal";
import DeleteModal from "./DeleteModal";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import { UserContext } from "@/contexts/UserContext";
import usePermissions from "@/hooks/usePermissions";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 20;

export default function ItemScreen() {
  const { idToken } = useAuthStatus();
  const { user } = useContext(UserContext);
  const permissions = usePermissions(user);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  /* --------------------------------
   * FETCH LOGIC (UNTOUCHED)
   * -------------------------------- */
  useEffect(() => {
    if (!user || !idToken) return;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await authFetch(
          `/api/read-items?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
          {},
          idToken,
        );

        if (!res.ok) throw new Error("Failed to fetch items");

        const data = await res.json();
        setItems(data.items);
        setTotalPages(Math.ceil(data.totalCount / ITEMS_PER_PAGE));
      } catch (err) {
        console.error("Fetch items error:", err);
        setItems([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user, idToken, currentPage]);

  const onClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
    onClose();
  };

  const confirmDelete = async (itemId) => {
    setDeleteItem(null);
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await authFetch(
        `/api/modify-items/${itemId}`,
        { method: "DELETE" },
        idToken,
      );
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* --------------------------------
   * SEARCH LOGIC
   * -------------------------------- */
  const handleSearch = async (e) => {
    if (e && e.key !== "Enter") return;
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setIsSearching(true);
    try {
      const storeId = user?.storeId || "";
      const res = await authFetch(
        `/api/search-items?query=${encodeURIComponent(searchQuery)}&storeId=${storeId}`,
        {},
        idToken,
      );

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        toast.error("Search failed");
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
  };

  const displayedItems = isSearching ? searchResults : items;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-pink mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Syncing Inventory...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* --- HEADER SECTION (CENTERED) --- */}
      <div className="relative flex flex-col items-center justify-center gap-6 mb-10 text-center">
        {/* Title Group */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <FiArchive className="text-brand-pink shrink-0" />
            <span>{permissions.canTrackStock ? "INVENTORY" : "ITEMS"}</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {isSearching ? `${searchResults.length} Results Found` : `${items.length} Products on Page ${currentPage}`}
          </p>
        </div>

        {/* Search Bar - Modern & Responsive */}
        <div className="w-full max-w-xl mx-auto px-4">
          <div className="relative flex items-center group transition-all duration-300">
            <div className="absolute left-4 text-gray-400 group-focus-within:text-brand-pink transition-colors">
              {searchLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-pink border-t-transparent" />
              ) : (
                <FiSearch size={18} strokeWidth={2.5} />
              )
            }
            </div>

            <input
              type="text"
              placeholder="Search by name or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 pl-12 pr-14 text-sm font-bold text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none transition-all focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 shadow-sm"
            />

            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <FiX size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl">
          {/* View Toggle (Hidden on small mobile) */}
          <div className="hidden sm:flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-brand-pink text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <FiGrid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === "table"
                  ? "bg-brand-pink text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <FiList size={16} /> List
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 dark:bg-brand-pink text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <FiPlus size={20} strokeWidth={3} />
            <span>ADD NEW ITEM</span>
          </button>
        </div>
      </div>

      {/* --- ITEMS DISPLAY --- */}
      <div
        className={`
        ${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4 max-w-5xl mx-auto"
        }
      `}
      >
        {displayedItems.length > 0 ? (
          displayedItems.map((item) => (
          <div
            key={item.id}
            className={`
              group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden
              ${
                viewMode === "table"
                  ? "md:flex md:items-center md:gap-6 md:p-2"
                  : "p-6 flex flex-col"
              }
            `}
          >
            {/* Action Buttons: Visible always on mobile, hover on large screens */}
            <div
              className={`
              flex gap-2 mb-4 md:mb-0
              ${
                viewMode === "table"
                  ? "md:order-3 md:pr-4"
                  : "absolute top-4 right-4 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
              }
            `}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingItem(item);
                  setIsModalOpen(true);
                }}
                className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <FiEdit size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteItem(item);
                }}
                className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                <FiTrash2 size={18} />
              </button>
            </div>

            {/* Product Body */}
            <div className={`flex-1 ${viewMode === "table" ? "md:pl-4" : ""}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-brand-pink/10 text-brand-pink border border-brand-pink/20">
                  {item.category}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  #{item?.id !== null ? item?.id.slice(-6)?.toUpperCase() : ""}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base leading-tight uppercase group-hover:text-brand-pink transition-colors">
                {item.name}
              </h3>
            </div>

            {/* Pricing Section */}
            <div
              className={`
              ${
                viewMode === "table"
                  ? "md:w-32 md:text-right md:order-2"
                  : "mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between"
              }
            `}
            >
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">
                  Unit Price
                </p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  <span className="text-xs font-normal mr-1">Nu.</span>
                  {Number(item.price).toLocaleString()}
                </p>
              </div>
              {/* {viewMode === "grid" && (
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              )} */}
                            {viewMode === "grid" && (
                permissions.canTrackStock ? (
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">
                      Stock
                    </p>
                    <p className={`text-xl font-black ${
                      (item.stock || 0) <= (item.minStock || 0) 
                        ? "text-red-500" 
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {item.stock || 0}
                    </p>
                  </div>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                )
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-20 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSearch className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Items Found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
          {isSearching && (
            <button
              onClick={clearSearch}
              className="mt-4 text-brand-pink font-bold uppercase text-xs tracking-widest hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
      </div>

      {/* --- PAGINATION (MODERN & RESPONSIVE) --- */}
      {!isSearching && (
        <div className="mt-12 flex items-center justify-center gap-2 sm:gap-3">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-20 hover:border-brand-pink transition-colors"
        >
          <FiChevronLeft className="dark:text-white" />
        </button>

        <div className="flex gap-1 sm:gap-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
          {(() => {
            // LOGIC: Show max 3-5 pages on mobile, more on desktop
            const delta = 1; // Number of pages to show on either side of current
            const range = [];
            for (
              let i = Math.max(2, currentPage - delta);
              i <= Math.min(totalPages - 1, currentPage + delta);
              i++
            ) {
              range.push(i);
            }

            if (currentPage > delta + 2) range.unshift("...");
            range.unshift(1);
            if (currentPage < totalPages - (delta + 1)) range.push("...");
            if (totalPages > 1) range.push(totalPages);

            return range.map((page, index) => (
              <button
                key={index}
                disabled={page === "..."}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-black transition-all ${
                  page === currentPage
                    ? "bg-white dark:bg-gray-700 text-brand-pink shadow-sm scale-105"
                    : page === "..."
                      ? "text-gray-400 cursor-default"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {page}
              </button>
            ));
          })()}
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-20 hover:border-brand-pink transition-colors"
        >
          <FiChevronRight className="dark:text-white" />
        </button>
      </div>
      )}

      {/* Modals */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={onClose}
        editingItem={editingItem}
        onAddItem={(newItem) => setItems((prev) => [newItem, ...prev])}
        onUpdateItem={handleUpdateItem}
        idToken={idToken}
      />

      <DeleteModal
        deleteItem={deleteItem}
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message={`Confirm deletion of ${deleteItem?.name}?`}
      />
    </div>
  );
}
