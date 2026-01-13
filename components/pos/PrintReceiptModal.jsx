"use client";

import { useRouter } from "next/navigation";

export default function PrintReceiptModal({ isOpen, onClose, saleId }) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-lg shadow-lg p-8 flex flex-col items-center">
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="text-green-500 mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          Payment Successful
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Would you like to print or save the receipt?
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            No, Thanks
          </button>
          <button
            onClick={() => router.push(`/invoice/${saleId}`)}
            className="flex-1 px-4 py-2 rounded-md btn-primary transition font-semibold"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
