"use client";
import { FiCheckCircle, FiTag, FiShoppingCart, FiHome } from "react-icons/fi";
import { useRef, useCallback } from "react";

export default function PosScreen({
  products,
  cartItems,
  onAddToCart,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) {
  // Intersection Observer for Infinite Scroll
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          if (onLoadMore) onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, onLoadMore],
  );

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900 custom-scrollbar">
      {/* Grid Container - Optimized for responsiveness */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-5">
        {products.map((product, index) => {
          const inCart = cartItems.find((item) => item.id === product.id);
          const quantity = inCart ? inCart.quantity : 0;
          const isLastElement = products.length === index + 1;

          return (
            <button
              ref={isLastElement ? lastElementRef : null}
              key={product.id}
              onClick={() => onAddToCart(product)}
              className={`
                group relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left active:scale-95 min-h-[160px]
                ${
                  inCart
                    ? "bg-brand-pink/5 border-brand-pink shadow-lg shadow-brand-pink/10 ring-1 ring-brand-pink"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-pink/50 hover:shadow-md"
                }
              `}
            >
              {/* Top Row: Category & Badges */}
              <div className="flex justify-between items-start w-full mb-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                  {product.category === "rooms" && (
                    <FiHome size={10} className="text-brand-pink" />
                  )}
                  {product.category}
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {product.isGSTExempt && (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tighter">
                      No GST
                    </span>
                  )}
                  {(product.discountPercent || 0) > 0 && (
                    <span className="text-[10px] font-black bg-brand-pink text-white px-2 py-0.5 rounded-lg shadow-sm shadow-brand-pink/20 uppercase animate-in zoom-in duration-300">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Product Name Area - Structured for long technical names */}
              <div className="flex-1 w-full overflow-hidden">
                <h3
                  className={`
                  font-bold text-sm leading-tight uppercase line-clamp-3 transition-colors
                  ${
                    inCart
                      ? "text-brand-pink"
                      : "text-gray-800 dark:text-gray-100 group-hover:text-brand-pink"
                  }
                `}
                >
                  {product.name}
                </h3>
                <p className="mt-1 text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase">
                  SKU: {product.barcode}
                </p>
              </div>

              {/* Bottom Section: Price & Cart Status */}
              <div
                className={`
                w-full pt-3 mt-3 border-t flex justify-between items-end
                ${
                  inCart
                    ? "border-brand-pink/20"
                    : "border-gray-50 dark:border-gray-700"
                }
              `}
              >
                <div className="flex flex-col items-start">
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">
                    Price
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[10px] font-normal text-gray-500">
                        Nu.
                      </span>
                      <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
                        {product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                {inCart ? (
                  <div className="flex items-center gap-1.5 animate-in zoom-in duration-300">
                    <span className="text-[11px] font-bold text-brand-pink">
                      {quantity > 1 ? `x${quantity}` : "IN CART"}
                    </span>
                    <FiCheckCircle className="text-brand-pink" size={18} />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-400 group-hover:bg-brand-pink group-hover:text-white transition-all">
                    <FiShoppingCart size={14} />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {/* Loader for Infinite Scroll */}
        {isLoadingMore && (
          <div className="col-span-full flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-pink"></div>
          </div>
        )}
      </div>
    </div>
  );
}
