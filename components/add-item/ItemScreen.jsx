"use client";
import { useEffect, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import AddItemModal from "./AddItemModal";
import DeleteModal from "./DeleteModal";
import useAuthStatus from "@/hooks/useAuthStatus";

export default function ItemScreen() {
  const { user, idToken } = useAuthStatus();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    if (!user || !idToken) return;

    const fetchItems = async () => {
      try {
        const res = await fetch("/api/read-items", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          setItems([]);
          return;
        }

        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Fetch items error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user, idToken]);

  const onClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    // Update item on the DB here.
    onClose();
  };

  // const confirmDelete = () => {
  //   setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
  //   setDeleteItem(null);
  // };

  const confirmDelete = async (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
    setDeleteItem(null);
    try {
      await fetch(`/api/modify-items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      // Optimistically update UI
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Top Bar */}
      <div className="relative mb-6 flex items-center">
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
          Items
        </h1>

        <div className="ml-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
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
            {/* Action Icons */}
            <div className="absolute top-3 right-3 flex gap-2">
              {/* Edit */}
              <button
                onClick={() => {
                  setEditingItem(item);
                  setIsModalOpen(true);
                }}
                className="text-gray-400 hover:text-amber-500 transition"
              >
                <FiEdit size={16} />
              </button>

              {/* Delete */}
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

      <AddItemModal
        isOpen={isModalOpen}
        onClose={onClose}
        editingItem={editingItem}
        onAddItem={(newItem) => setItems((prev) => [...prev, newItem])}
        onUpdateItem={handleUpdateItem}
        idToken={idToken}
      />
      {/* Delete Confirmation Modal */}
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
