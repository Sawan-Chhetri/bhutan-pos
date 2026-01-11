// "use client";
// import { useEffect, useState } from "react";
// import { FiEdit, FiTrash2 } from "react-icons/fi";
// import AddItemModal from "./AddItemModal";
// import DeleteModal from "./DeleteModal";
// import useAuthStatus from "@/hooks/useAuthStatus";

// export default function ItemScreen() {
//   const { user, idToken } = useAuthStatus();
//   const [loading, setLoading] = useState(true);
//   const [items, setItems] = useState([]);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [deleteItem, setDeleteItem] = useState(null);

//   useEffect(() => {
//     if (!user || !idToken) return;

//     const fetchItems = async () => {
//       try {
//         const res = await fetch("/api/read-items", {
//           headers: {
//             Authorization: `Bearer ${idToken}`,
//           },
//         });

//         if (!res.ok) {
//           setItems([]);
//           return;
//         }

//         const data = await res.json();
//         setItems(data);
//       } catch (err) {
//         console.error("Fetch items error:", err);
//         setItems([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchItems();
//   }, [user, idToken]);

//   const onClose = () => {
//     setIsModalOpen(false);
//     setEditingItem(null);
//   };

//   const handleUpdateItem = (updatedItem) => {
//     setItems((prev) =>
//       prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
//     );
//     // Update item on the DB here.
//     onClose();
//   };

//   // const confirmDelete = () => {
//   //   setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
//   //   setDeleteItem(null);
//   // };

//   const confirmDelete = async (itemId) => {
//     setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
//     setDeleteItem(null);
//     try {
//       await fetch(`/api/modify-items/${itemId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${idToken}`,
//         },
//       });

//       // Optimistically update UI
//       setItems((prev) => prev.filter((item) => item.id !== itemId));
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
//       {/* Top Bar */}
//       <div className="relative mb-6 flex items-center">
//         <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
//           Items
//         </h1>

//         <div className="ml-auto">
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="btn-primary px-4 py-2 font-semibold"
//           >
//             Add Item +
//           </button>
//         </div>
//       </div>

//       {/* Items Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         {items.map((item) => (
//           <div
//             key={item.id}
//             className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 relative"
//           >
//             {/* Action Icons */}
//             <div className="absolute top-3 right-3 flex gap-2">
//               {/* Edit */}
//               <button
//                 onClick={() => {
//                   setEditingItem(item);
//                   setIsModalOpen(true);
//                 }}
//                 className="text-gray-400 hover:text-brand-pink transition"
//               >
//                 <FiEdit size={16} />
//               </button>

//               {/* Delete */}
//               <button
//                 onClick={() => setDeleteItem(item)}
//                 className="text-gray-400 hover:text-red-500 transition"
//               >
//                 <FiTrash2 size={16} />
//               </button>
//             </div>

//             <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
//               {item.name}
//             </p>
//             <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//               Category: {item.category}
//             </p>
//             <p className="mt-2 font-medium text-gray-900 dark:text-white">
//               ₹{item.price}
//             </p>
//           </div>
//         ))}
//       </div>

//       <AddItemModal
//         isOpen={isModalOpen}
//         onClose={onClose}
//         editingItem={editingItem}
//         onAddItem={(newItem) => setItems((prev) => [...prev, newItem])}
//         onUpdateItem={handleUpdateItem}
//         idToken={idToken}
//       />
//       {/* Delete Confirmation Modal */}
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
import { useEffect, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import AddItemModal from "./AddItemModal";
import DeleteModal from "./DeleteModal";
import useAuthStatus from "@/hooks/useAuthStatus";

const ITEMS_PER_PAGE = 20;

export default function ItemScreen() {
  const { user, idToken } = useAuthStatus();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  /* --------------------------------
   * FETCH ITEMS (PAGINATED)
   * -------------------------------- */
  useEffect(() => {
    if (!user || !idToken) return;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/read-items?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
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

  /* --------------------------------
   * MODAL HELPERS
   * -------------------------------- */
  const onClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    onClose();
  };

  const confirmDelete = async (itemId) => {
    setDeleteItem(null);
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await fetch(`/api/modify-items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* --------------------------------
   * UI STATES
   * -------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-300">
        Loading items...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="relative mb-6 flex items-center">
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-900 dark:text-white">
          Items
        </h1>

        <div className="ml-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-4 py-2 font-semibold"
          >
            Add Item +
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 relative"
          >
            {/* Actions */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => {
                  setEditingItem(item);
                  setIsModalOpen(true);
                }}
                className="text-gray-400 hover:text-brand-pink transition"
              >
                <FiEdit size={16} />
              </button>

              <button
                onClick={() => setDeleteItem(item)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
              {item.name}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Category: {item.category}
            </p>
            <p className="mt-2 font-medium text-gray-900 dark:text-white">
              ₹{item.price}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center flex-wrap gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded-full border transition ${
              page === currentPage
                ? "bg-brand-pink text-white border-brand-pink"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

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
        message={`Are you sure you want to delete "${deleteItem?.name}"?`}
      />
    </div>
  );
}
