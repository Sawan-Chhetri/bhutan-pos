"use client";

export default function PosScreen({ products, cartItems, onAddToCart }) {
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => {
          const inCart = cartItems.find((item) => item.id === product.id);

          return (
            <button
              key={product.id}
              onClick={() => onAddToCart(product)}
              className={`relative flex flex-col justify-center items-center p-4 rounded-lg border transition-all duration-150 text-center cursor-pointer ${
                inCart
                  ? "border-brand-pink"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 product-hover hover:shadow-md"
              }`}
            >
              {/* GST Exempt Indicator */}
              {product.isGSTExempt && (
                <span
                  className="absolute top-2 right-2 text-[8px] font-semibold px-2 py-0.5 rounded-full gst-exempt-badge shadow-sm"
                  title="GST Exempt"
                >
                  NO GST
                </span>
              )}

              {/* Product Name */}
              <p className="font-semibold text-gray-800 dark:text-gray-100 truncate w-full">
                {product.name
                  .toLocaleString("en-US")
                  .replace(/^./, (str) => str.toUpperCase())}
              </p>

              {/* Price */}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                Nu. {product.price}
              </p>

              {/* Category Badge */}
              <span className="mt-2 text-xs px-2 py-0.5 rounded-full category-badge">
                {product.category.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
