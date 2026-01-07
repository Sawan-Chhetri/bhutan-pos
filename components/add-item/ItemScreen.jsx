"use client";
import { useState } from "react";
import AddItemModal from "./AddItemModal";

export default function ItemScreen() {
  // Sample items data (you can fetch from API later)
  const [items, setItems] = useState([
    { id: 1, name: "Veg Pasta", category: "Pasta", price: 180 },
    { id: 2, name: "Egg Sandwich", category: "Eggs", price: 120 },
    { id: 3, name: "Cold Coffee", category: "Drinks", price: 90 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const onClose = () => setIsModalOpen(false);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Top Bar */}
      <div className="relative mb-6 flex items-center">
        {/* Centered title */}
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-gray-900 dark:text-white">
          Items
        </h1>

        {/* Button on the right */}
        <div className="ml-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            Add Item +
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col"
            >
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
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No items added yet.</p>
      )}

      <AddItemModal
        isOpen={isModalOpen}
        onClose={onClose}
        onAddItem={(newItem) => {
          setItems((prev) => [...prev, newItem]);
        }}
      />
    </div>
  );
}
