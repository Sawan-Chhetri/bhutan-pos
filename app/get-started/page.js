// "use client";

// import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

// export default function GetStartedPage() {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-6">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center border border-blue-100 dark:border-blue-900">
//         <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 text-center">
//           Welcome to Swift<span className="text-[#A8DF8E]">GST.</span>
//         </h1>
//         <p className="text-gray-700 dark:text-gray-300 mb-6 text-center text-lg">
//           Get started with your modern POS & Invoice system. For onboarding,
//           support, or a demo, contact us below:
//         </p>
//         <div className="w-full space-y-4 mb-6">
//           <a
//             href="https://wa.me/97517123456"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-200 font-semibold shadow transition-all"
//           >
//             <FaWhatsapp size={22} />
//             WhatsApp: +975 17 123 456
//           </a>
//           <a
//             href="tel:+97517123456"
//             className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-semibold shadow transition-all"
//           >
//             <FaPhoneAlt size={20} />
//             Call: +975 17 123 456
//           </a>
//           <a
//             href="mailto:support@bhutanpos.com"
//             className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold shadow transition-all"
//           >
//             <FaEnvelope size={20} />
//             Email: support@bhutanpos.com
//           </a>
//         </div>
//         <div className="text-xs text-gray-400 text-center">
//           &copy; {new Date().getFullYear()} Bhutan POS. All rights reserved.
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function OnboardingContact() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-6 transition-all">
      {/* 1. BRANDING & VALUE PROP */}
      <div className="max-w-xl w-full text-center mb-8">
        <div className="text-2xl font-black tracking-tighter text-slate-950 italic mb-4">
          Swift<span className="text-[#A8DF8E]">GST.</span>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">
          The Future of Bhutanese Compliance
        </p>
      </div>

      {/* 2. THE MAIN CARD */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 lg:p-14 max-w-xl w-full relative overflow-hidden">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            Setup Your GST Hub
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Whether you run a{" "}
            <span className="text-black font-semibold italic">Retail Shop</span>{" "}
            or a{" "}
            <span className="text-black font-semibold italic">
              Service Agency
            </span>
            , we automate your compliance so you can focus on growth.
          </p>

          {/* Value Pillars for Selling */}
          <div className="grid grid-cols-1 gap-3 mb-10">
            {[
              "Rule-based GST Auto-Calculations",
              "Retail POS & Service Invoicing",
              "Real-time Inventory & Ledger tracking",
              "Instant BRS/DRC Compliant Reports",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400"
              >
                <FiCheckCircle className="text-green-500" size={14} />
                {text}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4 px-2">
              Connect with an Expert
            </h3>

            <a
              href="https://wa.me/97517123456"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between group px-6 py-5 rounded-[2rem] bg-green-50/50 hover:bg-green-600 transition-all border border-green-100"
            >
              <div className="flex items-center gap-4">
                <FaWhatsapp
                  size={20}
                  className="text-green-600 group-hover:text-white"
                />
                <span className="font-bold text-green-700 group-hover:text-white">
                  Chat on WhatsApp
                </span>
              </div>
              <FiArrowRight className="text-green-400 group-hover:text-white" />
            </a>

            <a
              href="tel:+97517123456"
              className="flex items-center justify-between group px-6 py-5 rounded-[2rem] bg-blue-50/50 hover:bg-blue-600 transition-all border border-blue-100"
            >
              <div className="flex items-center gap-4">
                <FaPhoneAlt
                  size={18}
                  className="text-blue-600 group-hover:text-white"
                />
                <span className="font-bold text-blue-700 group-hover:text-white">
                  Call for Demo
                </span>
              </div>
              <FiArrowRight className="text-blue-400 group-hover:text-white" />
            </a>

            <a
              href="mailto:support@bhutanpos.com"
              className="flex items-center justify-between group px-6 py-5 rounded-[2rem] bg-gray-50/50 hover:bg-black transition-all border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <FaEnvelope
                  size={18}
                  className="text-gray-600 group-hover:text-white"
                />
                <span className="font-bold text-gray-700 group-hover:text-white">
                  Email Support
                </span>
              </div>
              <FiArrowRight className="text-gray-400 group-hover:text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. FOOTER */}
      <footer className="mt-12 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">
          &copy; {new Date().getFullYear()} Swift GST Systems
        </p>
      </footer>
    </div>
  );
}
