"use client";

const categories = [
  "All",
  "Food",
  "Drinks",
  "Pasta",
  "Eggs",
  "Snacks",
  "Desserts",
];

export default function Menu({ active, onChange }) {
  return (
    <div className="flex lg:flex-col gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
            active === category
              ? "bg-amber-400 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-amber-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-amber-500"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
