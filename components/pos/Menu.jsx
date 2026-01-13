"use client";

import { useEffect, useState } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";

export default function Menu({ active, onChange, isSearching }) {
  const [categories, setCategories] = useState([]);
  const { idToken } = useAuthStatus();

  useEffect(() => {
    const fetchCategories = async () => {
      if (!idToken) return;
      try {
        const res = await (
          await import("@/lib/authFetch")
        ).default("/api/categories", { headers: {} }, idToken);

        if (!res.ok) {
          setCategories([]);
          return;
        }

        const data = await res.json(); // expected: [{ id, name }, ...]
        setCategories(data);

        // Automatically select first category
        if (data.length > 0) {
          onChange(data[0].name);
        }
      } catch (err) {
        console.error("Fetch categories error:", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [idToken, onChange]);

  return (
    <div className="flex lg:flex-col gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.name)}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer ${
            !isSearching && active === category.name
              ? "bg-brand-pink text-white"
              : "bg-gray-100 text-gray-700 hover:product-hover dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          {category.name.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
