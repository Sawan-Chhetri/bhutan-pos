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
  FiShoppingCart,
  FiPackage,
  FiClipboard,
  FiTrendingUp,
  FiRotateCcw, // Added for Refunds
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target))
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Define Navigation Sections
  const navSections = [
    {
      title: "Sales & Revenue",
      links: [
        {
          href: "/pos",
          label: "POS DASHBOARD",
          icon: <FiGrid size={18} />,
          condition:
            permissions.isPosUser ||
            permissions.isAdmin ||
            permissions.isRestaurantUser ||
            permissions.isHotelUser,
        },
        {
          href: "/invoice",
          label: "CREATE INVOICE",
          icon: <FiFileText size={18} />,
          condition: permissions.isBasicUser || permissions.isAdmin,
        },
        {
          href: "/invoices",
          label: "INVOICE HISTORY",
          icon: <FiClipboard size={18} />,
          condition: true,
        },
        {
          href: "/refunds", // THE NEW AUDIT PAGE
          label: "REFUND LEDGER",
          icon: <FiRotateCcw size={18} />,
          condition: true,
        },
      ],
    },
    {
      title: "Purchasing",
      links: [
        {
          href: "/purchases",
          label: "RECORD PURCHASE",
          icon: <FiPlusCircle size={18} />,
          condition: true,
        },
        {
          href: "/purchase-history",
          label: "PURCHASE HISTORY",
          icon: <FiShoppingCart size={18} />,
          condition: true,
        },
      ],
    },
    {
      title: "Taxation",
      links: [
        {
          href: "/gst-reports",
          label: "GST REPORTS",
          icon: <FiBarChart2 size={18} />,
          condition: true,
        },
      ],
    },
    {
      title: "Inventory",
      links: [
        {
          href: "/add-items",
          label: "MANAGE STOCK",
          icon: <FiPackage size={18} />,
          condition: permissions.canManageInventory,
        },
        {
          href: "/inventory-valuation",
          label: "STOCK VALUE",
          icon: <FiTrendingUp size={18} />,
          condition: permissions.isPosUser || permissions.isAdmin,
        },
        {
          href: "/shopping-list",
          label: "SHOPPING LIST",
          icon: <FiClipboard size={18} />,
          condition: permissions.canViewShoppingList,
        },
      ],
    },
  ];

  return (
    <>
      {/* --- TRIGGER --- */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 left-4 z-[60] p-3 rounded-xl shadow-xl border transition-all duration-300 active:scale-90 cursor-pointer 
          ${isSearchActive ? "opacity-0 pointer-events-none -translate-x-5" : "opacity-100 translate-x-0"}
          bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-brand-pink`}
      >
        <FiMenu size={22} strokeWidth={2.5} />
      </button>

      {/* --- DRAWER --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            ref={sidebarRef}
            className="bg-white dark:bg-gray-950 h-full w-72 sm:w-80 flex flex-col shadow-2xl border-r border-gray-100 dark:border-gray-800 animate-in slide-in-from-left duration-300"
          >
            {/* BRAND AREA */}
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                  SWIFT<span className="text-brand-pink italic">GST</span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-brand-pink cursor-pointer"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* USER PROFILE */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-white shadow-lg shrink-0">
                  <FiUser size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-gray-800 dark:text-white uppercase truncate">
                    {user?.name || "Operator"}
                  </span>
                  <span className="text-[9px] font-bold text-brand-pink uppercase tracking-widest truncate">
                    {user?.type || "POS"} Access
                  </span>
                </div>
              </div>
            </div>

            {/* NAV SCROLL AREA */}
            <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar pt-4 pb-8">
              {navSections.map((section, idx) => {
                const filteredLinks = section.links.filter(
                  (l) => l.condition !== false,
                );
                if (filteredLinks.length === 0) return null;

                return (
                  <div key={idx}>
                    <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {filteredLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                              ${isActive ? "bg-brand-pink text-white shadow-lg shadow-pink-500/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"}`}
                          >
                            <div className="flex items-center gap-4">
                              <span
                                className={
                                  isActive
                                    ? "text-white"
                                    : "text-gray-400 group-hover:text-brand-pink"
                                }
                              >
                                {link.icon}
                              </span>
                              <span className="text-[11px] font-black tracking-widest uppercase">
                                {link.label}
                              </span>
                            </div>
                            {isActive && (
                              <FiChevronRight
                                size={14}
                                className="animate-in slide-in-from-left-2"
                              />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* LOGOUT */}
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
            className="flex-1 bg-gray-900/40 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}
