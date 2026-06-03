"use client";

import { DataIssue, FixAction } from "@/lib/cleaner";

const FIX_OPTIONS: Record<string, FixAction[]> = {
  missing_value: ["fill_median", "flag", "drop"],
  duplicate:     ["keep_first", "keep_latest"],
  mixed_date:    ["normalise"],
  type_mismatch: ["ignore", "flag"],
};

const FIX_LABELS: Record<FixAction, string> = {
  fill_median:  "Fill with median",
  fill_empty:   "Fill with empty string",
  drop:         "Drop rows",
  flag:         "Flag rows",
  keep_first:   "Keep first occurrence",
  keep_latest:  "Keep latest occurrence",
  normalise:    "Normalise to ISO 8601",
  ignore:       "Ignore",
};

const TYPE_COLOURS: Record<string, string> = {
  missing_value: "#fee2e2",
  duplicate:     "#fee2e2",
  mixed_date:    "#fefce8",
  type_mismatch: "#fefce8",
};

interface CleanPanelProps {
  issues: DataIssue[];
  onChange: (id: string, fix: FixAction) => void;
}

export function CleanPanel({ issues, onChange }: CleanPanelProps) {
  if (!issues.length) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#15803d" }}>
          ✓ No issues found — dataset looks clean
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="rounded-xl px-4 py-4"
          style={{ background: TYPE_COLOURS[issue.type] ?? "#fff5f5", border: "1px solid #fecaca" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#dc2626" }}>
                {issue.description}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {issue.affectedRows} row{issue.affectedRows > 1 ? "s" : ""} affected
              </p>
            </div>

            <select
              className="text-xs rounded-lg px-2 py-1.5 border shrink-0"
              style={{ borderColor: "#fecaca", color: "var(--text-secondary)", background: "white" }}
              value={issue.chosenFix ?? issue.suggestedFix}
              onChange={(e) => onChange(issue.id, e.target.value as FixAction)}
            >
              {(FIX_OPTIONS[issue.type] ?? ["ignore"]).map((fix) => (
                <option key={fix} value={fix}>
                  {FIX_LABELS[fix]}
                  {fix === issue.suggestedFix ? " (recommended)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
