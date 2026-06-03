"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview",    href: "/",          icon: "⬡" },
  { label: "Upload",      href: "/upload",     icon: "⬆" },
  { label: "Products",    href: "/products",   icon: "◈" },
  { label: "Reviews",     href: "/reviews",    icon: "◎" },
  { label: "Reviewers",   href: "/reviewers",  icon: "◉" },
  { label: "AI Insights", href: "/insights",   icon: "✦" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 min-h-screen flex flex-col" style={{ background: "var(--color-sidebar-bg)" }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* RGC gradient pill */}
          <div
            className="w-6 h-6 rounded-md"
            style={{ background: "linear-gradient(135deg, #1D1B84 0%, #5A67D8 50%, #C061B9 100%)" }}
          />
          <span className="font-bold text-sm tracking-tight text-white">RGC Dashboard</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              style={active ? { background: "var(--color-rgc-electric)" } : {}}
            >
              <span className="text-xs opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-white/10 text-xs text-slate-600">
        Really Good Culture · 2026
      </div>
    </aside>
  );
}
