// // "use client";
// // import { useEffect, useRef, useState, useContext } from "react";
// // import Link from "next/link";
// // import { FiMenu } from "react-icons/fi";
// // import useLogout from "@/hooks/useLogout";
// // import { UserContext } from "@/contexts/UserContext";

// // export default function Sidebar() {
// //   const { user } = useContext(UserContext);
// //   const [isOpen, setIsOpen] = useState(false);
// //   const sidebarRef = useRef(null);
// //   const logout = useLogout();

// //   // Close on outside click
// //   useEffect(() => {
// //     const handleClickOutside = (e) => {
// //       if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
// //         setIsOpen(false);
// //       }
// //     };
// //     if (isOpen) {
// //       document.addEventListener("mousedown", handleClickOutside);
// //     }
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, [isOpen]);

// //   const links = [
// //     {
// //       href: "/pos",
// //       label: "Dashboard",
// //       roles: ["pos", "admin"],
// //     },
// //     {
// //       href: "/add-items",
// //       label: "Add Items",
// //       roles: ["pos", "admin"],
// //     },
// //     {
// //       href: "/invoice",
// //       label: "Create Invoice",
// //       roles: ["admin", "other"],
// //     },
// //     {
// //       href: "/invoices",
// //       label: "Invoices",
// //       roles: ["admin", "other", "pos"],
// //     },
// //     {
// //       href: "/gst-reports",
// //       label: "GST Report",
// //       roles: ["admin", "other", "pos"],
// //     },
// //     {
// //       label: "Log Out",
// //       isLogout: true,
// //       roles: ["pos", "admin", "other"],
// //     },
// //   ];

// //   const visibleLinks = links.filter(
// //     (link) => !link.roles || link.roles.includes(user?.type)
// //   );

// //   return (
// //     <>
// //       {/* Hamburger Icon */}
// //       <button
// //         onClick={() => setIsOpen(true)}
// //         className="p-3 md:p-4 fixed top-4 left-4 z-10 bg-white rounded-md shadow-md cursor-pointer md:shadow-lg transition"
// //       >
// //         <FiMenu size={20} className="md:h-6 md:w-6" />
// //       </button>

// //       {/* Sidebar */}
// //       {isOpen && (
// //         <div className="fixed inset-0 z-50 flex">
// //           <div
// //             ref={sidebarRef}
// //             className="bg-white shadow-lg p-4 md:p-6 h-full w-56 sm:w-64 md:w-64 transition-all"
// //           >
// //             <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">
// //               Bhutan POS
// //             </h2>
// //             <nav className="space-y-3">
// //               {visibleLinks.map((link) =>
// //                 link.isLogout ? (
// //                   <button
// //                     key={link.label}
// //                     onClick={() => {
// //                       setIsOpen(false);
// //                       logout?.();
// //                     }}
// //                     className="block text-left w-full text-gray-700 hover:text-primary"
// //                   >
// //                     {link.label}
// //                   </button>
// //                 ) : (
// //                   <Link
// //                     key={link.href}
// //                     href={link.href}
// //                     onClick={() => setIsOpen(false)}
// //                     className="block text-gray-700 hover:text-primary"
// //                   >
// //                     {link.label}
// //                   </Link>
// //                 )
// //               )}
// //             </nav>
// //           </div>

// //           {/* Overlay */}
// //           <div
// //             className="flex-1 bg-black/20 cursor-pointer"
// //             onClick={() => setIsOpen(false)}
// //           />
// //         </div>
// //       )}
// //     </>
// //   );
// // }

// "use client";
// import { useEffect, useRef, useState, useContext } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   FiMenu,
//   FiX,
//   FiGrid,
//   FiPlusCircle,
//   FiFileText,
//   FiBarChart2,
//   FiLogOut,
//   FiUser,
//   FiChevronRight,
// } from "react-icons/fi";
// import useLogout from "@/hooks/useLogout";
// import { UserContext } from "@/contexts/UserContext";

// export default function Sidebar() {
//   const { user } = useContext(UserContext);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isSearchActive, setIsSearchActive] = useState(false);
//   const sidebarRef = useRef(null);
//   const logout = useLogout();
//   const pathname = usePathname();

//   // 1. Logic to hide Sidebar trigger when Search is open on mobile
//   useEffect(() => {
//     const checkSearchOverlay = () => {
//       // Looks for the specific placeholder we defined in the Search component
//       const searchOverlay = document.querySelector(
//         'input[placeholder="Search catalog..."]'
//       );
//       setIsSearchActive(!!searchOverlay);
//     };

//     // Observer to watch for DOM changes (cleaner than an interval)
//     const observer = new MutationObserver(checkSearchOverlay);
//     observer.observe(document.body, { childList: true, subtree: true });

//     return () => observer.disconnect();
//   }, []);

//   // 2. Close sidebar on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
//         setIsOpen(false);
//       }
//     };
//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isOpen]);

//   const links = [
//     {
//       href: "/pos",
//       label: "POS DASHBOARD",
//       icon: <FiGrid size={18} />,
//       roles: ["pos", "admin"],
//     },
//     {
//       href: "/add-items",
//       label: "INVENTORY MGMT",
//       icon: <FiPlusCircle size={18} />,
//       roles: ["pos", "admin"],
//     },
//     {
//       href: "/invoice",
//       label: "CREATE INVOICE",
//       icon: <FiFileText size={18} />,
//       roles: ["admin", "other"],
//     },
//     {
//       href: "/invoices",
//       label: "INVOICE HISTORY",
//       icon: <FiFileText size={18} />,
//       roles: ["admin", "other", "pos"],
//     },
//     {
//       href: "/gst-reports",
//       label: "GST REPORTS",
//       icon: <FiBarChart2 size={18} />,
//       roles: ["admin", "other", "pos"],
//     },
//   ];

//   const visibleLinks = links.filter(
//     (link) => !link.roles || link.roles.includes(user?.type)
//   );

//   return (
//     <>
//       {/* --- HAMBURGER TRIGGER --- */}
//       {/* Hidden when search is active to prevent UI overlap on mobile */}
//       <button
//         onClick={() => setIsOpen(true)}
//         className={`fixed top-4 left-4 z-[60] p-3 rounded-xl shadow-xl border transition-all duration-300 active:scale-90 cursor-pointer group
//           ${
//             isSearchActive
//               ? "opacity-0 pointer-events-none translate-x-[-20px]"
//               : "opacity-100 translate-x-0"
//           }
//           bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-brand-pink
//         `}
//       >
//         <FiMenu
//           size={22}
//           strokeWidth={2.5}
//           className="group-hover:rotate-90 transition-transform duration-300"
//         />
//       </button>

//       {/* --- SIDEBAR OVERLAY & DRAWER --- */}
//       {isOpen && (
//         <div className="fixed inset-0 z-[100] flex">
//           {/* Main Panel */}
//           <div
//             ref={sidebarRef}
//             className="bg-white dark:bg-gray-950 h-full w-72 sm:w-80 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 border-r border-gray-100 dark:border-gray-800"
//           >
//             {/* Top Brand Area */}
//             <div className="p-8">
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
//                     BHUTAN <span className="text-brand-pink">POS</span>
//                   </h2>
//                   <p className="text-[9px] font-bold text-gray-400 tracking-[0.4em] uppercase mt-1">
//                     Industrial v2.0
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="p-2 text-gray-400 hover:text-brand-pink transition-colors cursor-pointer"
//                 >
//                   <FiX size={24} />
//                 </button>
//               </div>

//               {/* User Identity Section */}
//               <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-white shadow-lg shrink-0">
//                   <FiUser size={18} />
//                 </div>
//                 <div className="flex flex-col min-w-0">
//                   <span className="text-xs font-black text-gray-800 dark:text-white uppercase truncate">
//                     {user?.name || "Guest Operator"}
//                   </span>
//                   <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest truncate">
//                     {user?.type === "other" ? "Service" : "POS"} Access
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Navigation Section */}
//             <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
//               <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 mt-2">
//                 Navigation
//               </p>

//               {visibleLinks.map((link) => {
//                 const isActive = pathname === link.href;
//                 return (
//                   <Link
//                     key={link.href}
//                     href={link.href}
//                     onClick={() => setIsOpen(false)}
//                     className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group
//                       ${
//                         isActive
//                           ? "bg-brand-pink text-white shadow-lg shadow-pink-500/20"
//                           : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
//                       }
//                     `}
//                   >
//                     <div className="flex items-center gap-4">
//                       <span
//                         className={`${
//                           isActive
//                             ? "text-white"
//                             : "text-gray-400 group-hover:text-brand-pink"
//                         }`}
//                       >
//                         {link.icon}
//                       </span>
//                       <span className="text-xs font-black tracking-widest uppercase">
//                         {link.label}
//                       </span>
//                     </div>
//                     {isActive && (
//                       <FiChevronRight
//                         className="animate-in slide-in-from-left-2"
//                         size={14}
//                       />
//                     )}
//                   </Link>
//                 );
//               })}
//             </nav>

//             {/* Logout Footer */}
//             <div className="p-6 border-t border-gray-100 dark:border-gray-800">
//               <button
//                 onClick={() => {
//                   setIsOpen(false);
//                   logout?.();
//                 }}
//                 className="flex items-center gap-4 w-full px-4 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all group font-black text-xs uppercase tracking-widest cursor-pointer"
//               >
//                 <FiLogOut
//                   size={18}
//                   className="group-hover:-translate-x-1 transition-transform"
//                 />
//                 <span>Log Out</span>
//               </button>
//             </div>
//           </div>

//           {/* Semi-transparent Backdrop */}
//           <div
//             className="flex-1 bg-gray-900/40 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300"
//             onClick={() => setIsOpen(false)}
//           />
//         </div>
//       )}
//     </>
//   );
// }

"use client";
import { useEffect, useRef, useState, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiMenu,
  FiX,
  FiGrid,
  FiPlusCircle,
  FiFileText,
  FiBarChart2,
  FiLogOut,
  FiUser,
  FiChevronRight,
  FiShoppingCart, // Added for Purchases
  FiPackage, // Added for Inventory
  FiClipboard, // Added for Shopping List
} from "react-icons/fi";
import useLogout from "@/hooks/useLogout";
import usePermissions from "@/hooks/usePermissions";
import { UserContext } from "@/contexts/UserContext";

export default function Sidebar() {
  const { user } = useContext(UserContext);
  const permissions = usePermissions(user);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const sidebarRef = useRef(null);
  const logout = useLogout();
  const pathname = usePathname();

  // 1. Logic to hide Sidebar trigger when Search is open on mobile
  useEffect(() => {
    const checkSearchOverlay = () => {
      const searchOverlay = document.querySelector(
        'input[placeholder="Search catalog..."]',
      );
      setIsSearchActive(!!searchOverlay);
    };

    const observer = new MutationObserver(checkSearchOverlay);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // 2. Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const links = [
    {
      href: "/pos",
      label: "POS DASHBOARD",
      icon: <FiGrid size={18} />,
      // roles: ["pos", "admin", "restaurants"]
      condition: permissions.isPosUser || permissions.isAdmin || permissions.isRestaurantUser,
    },
    {
      href: "/add-items",
      label: "INVENTORY MGMT",
      icon: <FiPackage size={18} />,
      condition: permissions.canManageInventory,
    },
    // ---------------------------
    {
      href: "/invoice",
      label: "CREATE INVOICE",
      icon: <FiFileText size={18} />,
      // roles: ["admin", "other"]
      condition: permissions.isBasicUser || permissions.isAdmin,
    },
    {
      href: "/shopping-list",
      label: "SHOPPING LIST",
      icon: <FiClipboard size={18} />,
      condition: permissions.canViewShoppingList,
    },
    {
      href: "/invoices",
      label: "INVOICE HISTORY",
      icon: <FiFileText size={18} />,
      condition: true, // All authenticated users can view history (or restrict if needed)
    },
    // --- NEW PURCHASE ROUTES ---
    {
      href: "/purchases",
      label: "RECORD PURCHASE",
      icon: <FiPlusCircle size={18} />,
      condition: true, // Available to all active users
    },
    {
      href: "/purchase-history",
      label: "PURCHASE HISTORY",
      icon: <FiShoppingCart size={18} />,
      condition: true,
    },
    {
      href: "/gst-reports",
      label: "GST REPORTS",
      icon: <FiBarChart2 size={18} />,
      condition: true,
    },
  ];

  const visibleLinks = links.filter(
    (link) => link.condition !== false
  );

  return (
    <>
      {/* --- HAMBURGER TRIGGER --- */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 left-4 z-[60] p-3 rounded-xl shadow-xl border transition-all duration-300 active:scale-90 cursor-pointer group
          ${
            isSearchActive
              ? "opacity-0 pointer-events-none translate-x-[-20px]"
              : "opacity-100 translate-x-0"
          }
          bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-brand-pink
        `}
      >
        <FiMenu
          size={22}
          strokeWidth={2.5}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      </button>

      {/* --- SIDEBAR OVERLAY & DRAWER --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            ref={sidebarRef}
            className="bg-white dark:bg-gray-950 h-full w-72 sm:w-80 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 border-r border-gray-100 dark:border-gray-800"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                    SWIFT<span className="text-brand-pink italic">GST</span>
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-brand-pink transition-colors cursor-pointer"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-white shadow-lg shrink-0">
                  <FiUser size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-gray-800 dark:text-white uppercase truncate">
                    {user?.name || "Guest Operator"}
                  </span>
                  <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest truncate">
                    {user?.type === "other" ? "Service" : user?.type === "restaurants" ? "Restaurant" : "POS"} Access
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
              <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 mt-2">
                Navigation
              </p>

              {visibleLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group
                      ${
                        isActive
                          ? "bg-brand-pink text-white shadow-lg shadow-pink-500/20"
                          : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-brand-pink"
                        }`}
                      >
                        {link.icon}
                      </span>
                      <span className="text-xs font-black tracking-widest uppercase">
                        {link.label}
                      </span>
                    </div>
                    {isActive && (
                      <FiChevronRight
                        className="animate-in slide-in-from-left-2"
                        size={14}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout?.();
                }}
                className="flex items-center gap-4 w-full px-4 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all group font-black text-xs uppercase tracking-widest cursor-pointer"
              >
                <FiLogOut
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          <div
            className="flex-1 bg-gray-900/40 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}
