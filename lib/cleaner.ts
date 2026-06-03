/**
 * lib/cleaner.ts
 * Detects data quality issues and applies non-destructive fixes.
 * All fixes are tracked so the UI can show before/after diffs.
 */

import { ParsedDataset } from "./parser";

export type IssueType = "missing_value" | "duplicate" | "mixed_date" | "type_mismatch";
export type FixAction = "fill_median" | "fill_empty" | "drop" | "flag" | "keep_first" | "keep_latest" | "normalise" | "ignore";

export interface DataIssue {
  id: string;
  type: IssueType;
  column?: string;
  affectedRows: number;
  description: string;
  suggestedFix: FixAction;
  chosenFix?: FixAction;
}

export interface CleanResult {
  rows: Record<string, string>[];
  issues: DataIssue[];
  fixLog: string[];   // human-readable log for the thinking log
}

// ── Helpers ────────────────────────────────────────────────────────────────

function median(vals: number[]): number {
  const sorted = [...vals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function toISO(val: string): string {
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toISOString().split("T")[0];
}

// ── Detect issues ─────────────────────────────────────────────────────────

export function detectIssues(dataset: ParsedDataset): DataIssue[] {
  const issues: DataIssue[] = [];
  const { rows, columns } = dataset;

  // 1. Missing values per numeric column
  columns.forEach((col) => {
    if (col.type !== "number") return;
    const missing = rows.filter((r) => !r[col.key] || r[col.key].trim() === "").length;
    if (missing > 0) {
      issues.push({
        id: `missing_${col.key}`,
        type: "missing_value",
        column: col.key,
        affectedRows: missing,
        description: `${missing} missing value${missing > 1 ? "s" : ""} in "${col.key}"`,
        suggestedFix: "fill_median",
      });
    }
  });

  // 2. Missing values per string/transcript column
  columns.forEach((col) => {
    if (col.type !== "string" && col.type !== "transcript") return;
    const missing = rows.filter((r) => !r[col.key] || r[col.key].trim() === "").length;
    if (missing > 0) {
      issues.push({
        id: `missing_str_${col.key}`,
        type: "missing_value",
        column: col.key,
        affectedRows: missing,
        description: `${missing} empty value${missing > 1 ? "s" : ""} in "${col.key}"`,
        suggestedFix: "flag",
      });
    }
  });

  // 3. Duplicate rows (check for repeated id/reviewer+product combos)
  const idCol = columns.find((c) =>
    c.key.toLowerCase().includes("id") || c.key.toLowerCase().includes("reviewer")
  );
  if (idCol) {
    const seen = new Map<string, number>();
    rows.forEach((r) => {
      const v = r[idCol.key] ?? "";
      seen.set(v, (seen.get(v) ?? 0) + 1);
    });
    const dupes = [...seen.values()].filter((c) => c > 1).reduce((a, c) => a + (c - 1), 0);
    if (dupes > 0) {
      issues.push({
        id: "duplicates",
        type: "duplicate",
        affectedRows: dupes,
        description: `${dupes} duplicate row${dupes > 1 ? "s" : ""} (by "${idCol.key}")`,
        suggestedFix: "keep_first",
      });
    }
  }

  // 4. Mixed date formats
  const dateCol = columns.find((c) => c.type === "date");
  if (dateCol) {
    const formats = new Set(
      rows
        .map((r) => r[dateCol.key])
        .filter(Boolean)
        .map((v) => {
          if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return "iso";
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return "us";
          if (/^\d{2}-\d{2}-\d{4}$/.test(v)) return "eu";
          return "other";
        })
    );
    if (formats.size > 1) {
      issues.push({
        id: `mixed_date_${dateCol.key}`,
        type: "mixed_date",
        column: dateCol.key,
        affectedRows: rows.length,
        description: `Mixed date formats in "${dateCol.key}" (${[...formats].join(", ")})`,
        suggestedFix: "normalise",
      });
    }
  }

  return issues;
}

// ── Apply fixes ────────────────────────────────────────────────────────────

export function applyFixes(dataset: ParsedDataset, issues: DataIssue[]): CleanResult {
  let rows: Record<string, string>[] = dataset.rows.map((r) => ({ ...r, _status: "clean" }));
  const fixLog: string[] = [];

  issues.forEach((issue) => {
    const fix = issue.chosenFix ?? issue.suggestedFix;

    if (issue.type === "missing_value" && issue.column) {
      const col = issue.column;
      const numericVals = rows
        .filter((r) => r[col] && r[col].trim() !== "")
        .map((r) => parseFloat(r[col]))
        .filter((n) => !isNaN(n));

      const med = numericVals.length ? median(numericVals) : null;

      rows = rows.map((r) => {
        if (r[col] && r[col].trim() !== "") return r;
        if (fix === "fill_median" && med !== null) {
          fixLog.push(`Filled missing "${col}" with median ${med.toFixed(1)}`);
          return { ...r, [col]: String(med.toFixed(1)), _status: "filled" };
        }
        if (fix === "flag") {
          return { ...r, _status: "flagged" };
        }
        if (fix === "drop") {
          return { ...r, _status: "dropped" };
        }
        return r;
      });

      if (fix === "drop") {
        const before = rows.length;
        rows = rows.filter((r) => r._status !== "dropped");
        fixLog.push(`Dropped ${before - rows.length} rows with missing "${col}"`);
      }
    }

    if (issue.type === "duplicate") {
      const idCol = dataset.columns.find((c) =>
        c.key.toLowerCase().includes("id") || c.key.toLowerCase().includes("reviewer")
      );
      if (!idCol) return;
      const seen = new Set<string>();
      const before = rows.length;
      rows = rows.filter((r) => {
        const v = r[idCol.key] ?? "";
        if (seen.has(v)) {
          if (fix === "keep_first") return false;
        }
        seen.add(v);
        return true;
      });
      fixLog.push(`Removed ${before - rows.length} duplicate rows (kept first occurrence)`);
    }

    if (issue.type === "mixed_date" && issue.column) {
      const col = issue.column;
      rows = rows.map((r) => ({ ...r, [col]: toISO(r[col]) }));
      fixLog.push(`Normalised "${col}" to ISO 8601 (YYYY-MM-DD)`);
    }
  });

  return { rows, issues, fixLog };
}
