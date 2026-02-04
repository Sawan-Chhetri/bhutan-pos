// "use client";

// export default function PosScreen({ products, cartItems, onAddToCart }) {
//   return (
//     <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 gap-4">
//         {products.map((product) => {
//           const inCart = cartItems.find((item) => item.id === product.id);

//           return (
//             <button
//               key={product.id}
//               onClick={() => onAddToCart(product)}
//               className={`relative flex flex-col justify-center items-center p-4 rounded-lg border transition-all duration-150 text-center cursor-pointer ${
//                 inCart
//                   ? "border-brand-pink"
//                   : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 product-hover hover:shadow-md"
//               }`}
//             >
//               {/* GST Exempt Indicator */}
//               {product.isGSTExempt && (
//                 <span
//                   className="absolute top-2 right-2 text-[8px] font-semibold px-2 py-0.5 rounded-full gst-exempt-badge shadow-sm"
//                   title="GST Exempt"
//                 >
//                   NO GST
//                 </span>
//               )}

//               {/* Product Name */}
//               <p className="font-semibold text-gray-800 dark:text-gray-100 truncate w-full">
//                 {product.name
//                   .toLocaleString("en-US")
//                   .replace(/^./, (str) => str.toUpperCase())}
//               </p>

//               {/* Price */}
//               <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
//                 Nu. {product.price}
//               </p>

//               {/* Category Badge */}
//               <span className="mt-2 text-xs px-2 py-0.5 rounded-full category-badge">
//                 {product.category.toUpperCase()}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// "use client";
// export default function PosScreen({ products, cartItems, onAddToCart }) {
//   return (
//     <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 gap-4">
//         {products.map((product) => {
//           const inCart = cartItems.find((item) => item.id === product.id);

//           return (
//             <button
//               key={product.id}
//               onClick={() => onAddToCart(product)}
//               className={`relative flex flex-col items-start p-4 rounded-xl border transition-all duration-150 text-left cursor-pointer min-h-40 ${
//                 inCart
//                   ? "border-brand-pink ring-2 ring-brand-pink/20 bg-brand-pink/5"
//                   : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-brand-pink/50"
//               }`}
//             >
//               {/* GST Exempt Indicator */}
//               {product.isGSTExempt && (
//                 <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase">
//                   No GST
//                 </span>
//               )}

//               {/* Product Name Area - Fixed height ensures alignment */}
//               <div className="mb-auto w-full">
//                 <p className="font-bold text-sm leading-tight text-gray-900 dark:text-gray-100 line-clamp-3 uppercase h-auto">
//                   {product.name}
//                 </p>
//                 <p className="mt-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
//                   {product.category}
//                 </p>
//               </div>

//               {/* Bottom Section: Price & Interaction */}
//               <div className="w-full pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
//                 <div className="flex flex-col">
//                   <span className="text-[10px] text-gray-400 uppercase font-semibold">
//                     Price
//                   </span>
//                   <span className="text-md font-bold text-brand-pink dark:text-pink-400">
//                     Nu. {product.price}
//                   </span>
//                 </div>

//                 {/* Visual feedback if in cart */}
//                 {inCart && (
//                   <div className="bg-brand-pink text-white p-1 rounded-full">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   </div>
//                 )}
//               </div>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";
import { FiCheckCircle, FiTag, FiShoppingCart } from "react-icons/fi";

export default function PosScreen({ products, cartItems, onAddToCart }) {
  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900 custom-scrollbar">
      {/* Grid Container - Optimized for responsiveness */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-5">
        {products.map((product) => {
          const inCart = cartItems.find((item) => item.id === product.id);
          const quantity = inCart ? inCart.quantity : 0;

          return (
            <button
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
                <span
                  className={`
                  px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border
                  ${
                    inCart
                      ? "bg-brand-pink text-white border-brand-pink"
                      : "bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                  }
                `}
                >
                  {product.category}
                </span>

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
      </div>
    </div>
  );
}
