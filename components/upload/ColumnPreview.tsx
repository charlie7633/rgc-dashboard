"use client";

import { DetectedColumn } from "@/lib/parser";

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  string:     { label: "text",          color: "#4338ca", bg: "#eef2ff" },
  number:     { label: "number",        color: "#166534", bg: "#dcfce7" },
  date:       { label: "date",          color: "#0369a1", bg: "#e0f2fe" },
  transcript: { label: "🤖 transcript", color: "#854d0e", bg: "#fef9c3" },
  unknown:    { label: "⚠ unknown",     color: "#dc2626", bg: "#fee2e2" },
};

const FIELD_OPTIONS = [
  { value: "",                label: "— map this column —" },
  { value: "product_name",   label: "product_name" },
  { value: "rating",         label: "rating" },
  { value: "reviewer_id",    label: "reviewer_id" },
  { value: "review_date",    label: "review_date" },
  { value: "transcript_text",label: "transcript_text" },
  { value: "category",       label: "category" },
  { value: "price",          label: "price" },
  { value: "quantity",       label: "quantity" },
  { value: "sentiment",      label: "sentiment" },
  { value: "brand",          label: "brand" },
  { value: "other",          label: "other (keep original)" },
  { value: "ignore",         label: "ignore column" },
];

interface ColumnPreviewProps {
  columns: DetectedColumn[];
  onChange: (key: string, mappedAs: string) => void;
}

export function ColumnPreview({ columns, onChange }: ColumnPreviewProps) {
  const aiCount = columns.filter((c) => c.aiSuggested).length;

  return (
    <div>
      {aiCount > 0 && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs"
          style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#854d0e" }}>
          <span>✦</span>
          <span><strong>Gemini auto-mapped {aiCount} of {columns.length} columns.</strong> Review and adjust below — you can override any suggestion.</span>
        </div>
      )}

      <div className="space-y-2">
        {columns.map((col) => {
          const meta = TYPE_LABELS[col.type] ?? TYPE_LABELS.unknown;
          const hasMapping = col.mappedAs && col.mappedAs !== "other";
          return (
            <div key={col.key}
              className="flex items-center gap-3 rounded-lg px-4 py-3"
              style={{
                background: col.aiSuggested ? "#fefce8" : col.type === "unknown" ? "#fff5f5" : "#f8fafc",
                border: `1px solid ${col.aiSuggested ? "#fde68a" : "var(--color-card-border)"}`,
              }}>

              {/* Column name */}
              <div className="w-36 shrink-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-secondary)" }}>{col.key}</p>
                {col.nullCount > 0 && <p className="text-xs" style={{ color: "var(--text-danger)" }}>{col.nullCount} missing</p>}
              </div>

              {/* Type badge */}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ color: meta.color, background: meta.bg }}>
                {meta.label}
              </span>

              {/* Sample values */}
              <div className="flex-1 flex gap-1.5 overflow-hidden">
                {col.sample.slice(0, 3).map((s, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded truncate max-w-[110px]"
                    style={{ background: "#f1f5f9", color: "var(--text-muted)" }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Mapping dropdown — shown for all columns */}
              <div className="flex items-center gap-1.5 shrink-0">
                {col.aiSuggested && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: "#fde68a", color: "#854d0e" }}>✦ AI</span>
                )}
                <select
                  className="text-xs rounded-lg px-2 py-1.5 border"
                  style={{
                    borderColor: col.aiSuggested ? "#fde68a" : "var(--color-card-border)",
                    color: hasMapping ? "var(--color-rgc-electric)" : "var(--text-secondary)",
                    fontWeight: hasMapping ? "600" : "400",
                  }}
                  value={col.mappedAs ?? ""}
                  onChange={(e) => onChange(col.key, e.target.value)}
                >
                  {FIELD_OPTIONS.map((o, fi) => (
                    <option key={`${col.key}-opt-${fi}`} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
