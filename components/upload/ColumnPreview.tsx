"use client";

import { DetectedColumn } from "@/lib/parser";

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  string:     { label: "text",       color: "#4338ca", bg: "#eef2ff" },
  number:     { label: "number",     color: "#166534", bg: "#dcfce7" },
  date:       { label: "date",       color: "#0369a1", bg: "#e0f2fe" },
  transcript: { label: "🤖 transcript", color: "#854d0e", bg: "#fef9c3" },
  unknown:    { label: "⚠ unknown",  color: "#dc2626", bg: "#fee2e2" },
};

const FIELD_OPTIONS = [
  "product_name",
  "rating",
  "review_date",
  "reviewer_id",
  "transcript_text",
  "category",
  "ignore",
];

interface ColumnPreviewProps {
  columns: DetectedColumn[];
  onChange: (key: string, mappedAs: string) => void;
}

export function ColumnPreview({ columns, onChange }: ColumnPreviewProps) {
  return (
    <div className="space-y-2">
      {columns.map((col) => {
        const meta = TYPE_LABELS[col.type] ?? TYPE_LABELS.unknown;
        return (
          <div
            key={col.key}
            className="flex items-center gap-3 rounded-lg px-4 py-3"
            style={{ background: col.type === "unknown" ? "#fff5f5" : "#f8fafc", border: "1px solid var(--color-card-border)" }}
          >
            {/* Column name */}
            <div className="w-36 shrink-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-secondary)" }}>
                {col.key}
              </p>
              {col.nullCount > 0 && (
                <p className="text-xs" style={{ color: "var(--text-danger)" }}>
                  {col.nullCount} missing
                </p>
              )}
            </div>

            {/* Type badge */}
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{ color: meta.color, background: meta.bg }}
            >
              {meta.label}
            </span>

            {/* Sample values */}
            <div className="flex-1 flex gap-1.5 overflow-hidden">
              {col.sample.slice(0, 3).map((s, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded truncate max-w-[110px]"
                  style={{ background: "#f1f5f9", color: "var(--text-muted)" }}
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Mapping dropdown — shown for unknown columns */}
            {col.type === "unknown" && (
              <select
                className="text-xs rounded-lg px-2 py-1.5 border shrink-0"
                style={{ borderColor: "var(--color-card-border)", color: "var(--text-secondary)" }}
                value={col.mappedAs ?? ""}
                onChange={(e) => onChange(col.key, e.target.value)}
              >
                <option value="">Map this column…</option>
                {FIELD_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}
