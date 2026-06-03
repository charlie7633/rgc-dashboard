"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Reviews", href: "/reviews" },
  { label: "Reviewers", href: "/reviewers" },
  { label: "AI Insights", href: "/insights" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-950 text-white min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-gray-800">
        <span className="font-bold text-lg tracking-tight">RGC Dashboard</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-500">
        Really Good Culture · Assessment
      </div>
    </aside>
  );
}
