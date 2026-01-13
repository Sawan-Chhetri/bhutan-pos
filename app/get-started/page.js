"use client";

import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function GetStartedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center border border-blue-100 dark:border-blue-900">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 text-center">
          Welcome to Bhutan POS
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-center text-lg">
          Get started with your modern POS & Invoice system. For onboarding,
          support, or a demo, contact us below:
        </p>
        <div className="w-full space-y-4 mb-6">
          <a
            href="https://wa.me/97517123456"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-200 font-semibold shadow transition-all"
          >
            <FaWhatsapp size={22} />
            WhatsApp: +975 17 123 456
          </a>
          <a
            href="tel:+97517123456"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-semibold shadow transition-all"
          >
            <FaPhoneAlt size={20} />
            Call: +975 17 123 456
          </a>
          <a
            href="mailto:support@bhutanpos.com"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold shadow transition-all"
          >
            <FaEnvelope size={20} />
            Email: support@bhutanpos.com
          </a>
        </div>
        <div className="text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Bhutan POS. All rights reserved.
        </div>
      </div>
    </div>
  );
}
