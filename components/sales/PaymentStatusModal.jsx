"use client";

export default function PaymentStatusModal({
  isOpen,
  onClose,
  paid,
  onToggle,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          Payment Status
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Has this invoice been paid?
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => {
              onToggle(!paid);
              onClose();
            }}
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition ${
              paid
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            }`}
          >
            {paid ? "Mark as Unpaid" : "Mark as Paid"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
