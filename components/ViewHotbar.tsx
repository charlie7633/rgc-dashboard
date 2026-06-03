"use client";

import { useEffect, useRef, useState } from "react";
import { ViewOption } from "./upload/ViewPicker";

const ALL_VIEWS: { id: ViewOption; icon: string; label: string }[] = [
  { id: "bar",     icon: "📊", label: "Bar" },
  { id: "pie",     icon: "🥧", label: "Pie" },
  { id: "line",    icon: "📈", label: "Line" },
  { id: "table",   icon: "🗂️", label: "Table" },
  { id: "heatmap", icon: "🌡", label: "Heatmap" },
  { id: "ai",      icon: "🤖", label: "AI" },
];

interface Props {
  available: ViewOption[];
  active: ViewOption;
  onChange: (v: ViewOption) => void;
  onAdd: (v: ViewOption) => void;
}

export function ViewHotbar({ available, active, onChange, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hidden = ALL_VIEWS.filter((v) => !available.includes(v.id));

  // Close popover on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Hotbar pill */}
      <div
        className="inline-flex items-center gap-1 rounded-xl p-1"
        style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}
      >
        {ALL_VIEWS.filter((v) => available.includes(v.id)).map((v) => {
          const isActive = v.id === active;
          return (
            <button
              key={v.id}
              onClick={() => onChange(v.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: isActive ? "var(--color-rgc-electric)" : "transparent",
                color: isActive ? "white" : "var(--text-muted)",
              }}
            >
              <span>{v.icon}</span>
              {v.label}
            </button>
          );
        })}
      </div>

      {/* + button with popover — only shown if there are hidden views */}
      {hidden.length > 0 && (
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
            style={{
              background: open ? "var(--color-rgc-electric)" : "var(--color-card)",
              border: "1px solid var(--color-card-border)",
              color: open ? "white" : "var(--text-muted)",
            }}
            title="Add a view"
          >
            +
          </button>

          {open && (
            <div
              className="absolute right-0 top-10 z-50 rounded-xl p-1.5 min-w-[140px] shadow-lg"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}
            >
              <p className="px-2 py-1 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Add view
              </p>
              {hidden.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { onAdd(v.id); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span>{v.icon}</span> {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
