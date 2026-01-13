"use client";
import { useEffect, useRef, useState, useContext } from "react";
import Link from "next/link";
import { FiMenu } from "react-icons/fi";
import useLogout from "@/hooks/useLogout";
import { UserContext } from "@/contexts/UserContext";

export default function Sidebar() {
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const logout = useLogout();

  // Close on outside click
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
      label: "Dashboard",
      roles: ["pos", "admin"],
    },
    {
      href: "/add-items",
      label: "Add Items",
      roles: ["pos", "admin"],
    },
    {
      href: "/invoice",
      label: "Create Invoice",
      roles: ["admin", "other"],
    },
    {
      href: "/invoices",
      label: "Invoices",
      roles: ["admin", "other", "pos"],
    },
    {
      href: "/gst-reports",
      label: "GST Report",
      roles: ["admin", "other", "pos"],
    },
    {
      label: "Log Out",
      isLogout: true,
      roles: ["pos", "admin", "other"],
    },
  ];

  const visibleLinks = links.filter(
    (link) => !link.roles || link.roles.includes(user?.type)
  );

  return (
    <>
      {/* Hamburger Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 md:p-4 fixed top-4 left-4 z-10 bg-white rounded-md shadow-md cursor-pointer md:shadow-lg transition"
      >
        <FiMenu size={20} className="md:h-6 md:w-6" />
      </button>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            ref={sidebarRef}
            className="bg-white shadow-lg p-4 md:p-6 h-full w-56 sm:w-64 md:w-64 transition-all"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">
              Bhutan POS
            </h2>
            <nav className="space-y-3">
              {visibleLinks.map((link) =>
                link.isLogout ? (
                  <button
                    key={link.label}
                    onClick={() => {
                      setIsOpen(false);
                      logout?.();
                    }}
                    className="block text-left w-full text-gray-700 hover:text-primary"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-gray-700 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* Overlay */}
          <div
            className="flex-1 bg-black/20 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}
