"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ALL_NAV = [
  { label: "Overview",    href: "/overview",   icon: "⬡", demoOnly: false },
  { label: "Brands",      href: "/brands",     icon: "◆", demoOnly: true  },
  { label: "Products",    href: "/products",   icon: "◈", demoOnly: false },
  { label: "Transcripts", href: "/reviews",    icon: "◎", demoOnly: true  },
  { label: "Reviewers",   href: "/reviewers",  icon: "◉", demoOnly: true  },
  { label: "AI Insights", href: "/insights",   icon: "✦", demoOnly: false },
  { label: "Upload",      href: "/upload",     icon: "⬆", demoOnly: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    setMode(sessionStorage.getItem("rgc_mode"));
  }, [pathname]); // re-read on each navigation

  const navItems = ALL_NAV.filter((item) => !item.demoOnly || mode === "demo");

  return (
    <aside className="w-56 shrink-0 min-h-screen flex flex-col" style={{ background: "var(--color-sidebar-bg)" }}>
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md"
            style={{ background: "linear-gradient(135deg, #1D1B84 0%, #5A67D8 50%, #C061B9 100%)" }} />
          <span className="font-bold text-sm tracking-tight text-white">RGC Dashboard</span>
        </div>
        {mode && (
          <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full"
            style={{ background: mode === "demo" ? "rgba(90,103,216,0.3)" : "rgba(78,164,181,0.3)", color: mode === "demo" ? "#a5b4fc" : "#6ee7b7" }}>
            {mode === "demo" ? "✦ RGC demo" : "⬆ custom data"}
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              style={active ? { background: "var(--color-rgc-electric)" } : {}}>
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
