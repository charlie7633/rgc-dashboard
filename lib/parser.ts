/**
 * lib/parser.ts
 * Parses uploaded CSV or JSON files into a typed dataset.
 * Detects column types and flags transcript columns for Gemini.
 */

export type ColumnType = "string" | "number" | "date" | "transcript" | "unknown";

export interface DetectedColumn {
  key: string;
  type: ColumnType;
  sample: string[];          // first 3 non-empty values
  nullCount: number;
  mappedAs?: string;         // canonical field name (user or AI assigned)
  aiSuggested?: boolean;     // true if mappedAs was set by Gemini
}

export interface ParsedDataset {
  rows: Record<string, string>[];
  columns: DetectedColumn[];
  rowCount: number;
  fileName: string;
  fileType: "csv" | "json";
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isNumeric(val: string): boolean {
  return val.trim() !== "" && !isNaN(Number(val));
}

function isDate(val: string): boolean {
  if (!val.trim()) return false;
  const d = new Date(val);
  return !isNaN(d.getTime()) && val.length > 4;
}

function isTranscript(vals: string[]): boolean {
  const avg = vals.reduce((s, v) => s + v.length, 0) / (vals.length || 1);
  return avg > 60; // average char length > 60 → treat as free-text transcript
}

const KNOWN_KEYS: Record<string, string> = {
  product_name: "product_name",
  product: "product_name",
  name: "product_name",
  rating: "rating",
  score: "rating",
  stars: "rating",
  review_date: "review_date",
  date: "review_date",
  created_at: "review_date",
  reviewer: "reviewer_id",
  reviewer_id: "reviewer_id",
  user_id: "reviewer_id",
  reviewer_name: "reviewer_id",
  review: "transcript_text",
  review_text: "transcript_text",
  transcript: "transcript_text",
  transcript_text: "transcript_text",
  body: "transcript_text",
  text: "transcript_text",
  comment: "transcript_text",
  category: "category",
  product_category: "category",
};

function detectType(key: string, values: string[]): ColumnType {
  const nonEmpty = values.filter(Boolean);
  if (!nonEmpty.length) return "unknown";

  const lk = key.toLowerCase().replace(/\s+/g, "_");
  if (lk.includes("transcript") || lk.includes("review") || lk.includes("comment") || lk.includes("text") || lk.includes("body")) {
    if (isTranscript(nonEmpty)) return "transcript";
  }

  const numericCount = nonEmpty.filter(isNumeric).length;
  if (numericCount / nonEmpty.length > 0.8) return "number";

  const dateCount = nonEmpty.filter(isDate).length;
  if (dateCount / nonEmpty.length > 0.7) return "date";

  if (isTranscript(nonEmpty)) return "transcript";

  return "string";
}

// ── CSV Parser ─────────────────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    // basic CSV split — handles quoted fields
    const values: string[] = [];
    let cur = "";
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { values.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    values.push(cur.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

// ── Main export ────────────────────────────────────────────────────────────

export async function parseFile(file: File): Promise<ParsedDataset> {
  const text = await file.text();
  const ext = file.name.split(".").pop()?.toLowerCase();

  let rows: Record<string, string>[];
  let fileType: "csv" | "json";

  if (ext === "json") {
    const parsed = JSON.parse(text);
    rows = Array.isArray(parsed) ? parsed : parsed.data ?? parsed.rows ?? [];
    fileType = "json";
  } else {
    rows = parseCSV(text);
    fileType = "csv";
  }

  if (!rows.length) throw new Error("No rows found in file.");

  const keys = Object.keys(rows[0]);

  const columns: DetectedColumn[] = keys.map((key) => {
    const values = rows.map((r) => String(r[key] ?? ""));
    const nonEmpty = values.filter(Boolean);
    const type = detectType(key, values);
    const lk = key.toLowerCase().replace(/\s+/g, "_");
    const mappedAs = KNOWN_KEYS[lk];

    return {
      key,
      type,
      sample: nonEmpty.slice(0, 3),
      nullCount: values.length - nonEmpty.length,
      mappedAs,
    };
  });

  return { rows, columns, rowCount: rows.length, fileName: file.name, fileType };
}
