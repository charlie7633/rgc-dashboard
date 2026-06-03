"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DropZone } from "@/components/upload/DropZone";
import { CleanPanel } from "@/components/upload/CleanPanel";
import { ViewPicker, ViewOption } from "@/components/upload/ViewPicker";
import { parseFile, ParsedDataset } from "@/lib/parser";
import { detectIssues, applyFixes, DataIssue, FixAction } from "@/lib/cleaner";
import { resolveCol, PRODUCT_KEYS, RATING_KEYS, REVIEWER_KEYS, DATE_KEYS } from "@/lib/col-resolver";

// Fallback dictionary for when Gemini is unavailable
const FALLBACK_MAP: Record<string, string> = {
  // product names
  "product name": "product_name", "product": "product_name", "item": "product_name",
  "product category": "product_name", "category": "category", "name": "product_name",
  // ratings
  "rating": "rating", "score": "rating", "stars": "rating", "review score": "rating",
  "price per unit": "price", "price": "price", "unit price": "price",
  // reviewers
  "customer id": "reviewer_id", "reviewer": "reviewer_id", "user id": "reviewer_id",
  "customer name": "reviewer_id", "reviewer id": "reviewer_id",
  // dates
  "date": "review_date", "review date": "review_date", "order date": "review_date",
  "created at": "review_date", "transaction date": "review_date",
  // text
  "review": "transcript_text", "review text": "transcript_text", "comment": "transcript_text",
  "feedback": "transcript_text", "description": "transcript_text",
  // quantity
  "quantity": "quantity", "qty": "quantity", "units": "quantity",
  // ignore
  "transaction id": "ignore", "order id": "ignore", "row id": "ignore", "id": "ignore",
};

type Step = 1 | 2 | 3;
const STEP_LABELS = ["Upload", "Review data", "Choose views"];

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<string | null>(null); // loading status message
  const [error, setError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [issues, setIssues] = useState<DataIssue[]>([]);
  const [mappedCols, setMappedCols] = useState<string[]>([]);
  const [selectedViews, setSelectedViews] = useState<ViewOption[]>(["bar", "pie", "table", "ai"]);

  // ── Demo dataset ───────────────────────────────────────────────────────
  async function handleLoadDemo() {
    setDemoLoading(true);
    sessionStorage.clear();
    sessionStorage.setItem("rgc_mode", "demo");
    router.push("/overview");
  }

  // ── File upload → auto-map → detect issues → skip to step 2 ──────────
  async function handleFile(file: File) {
    setError(null);
    setStatus("Parsing file…");
    try {
      const parsed = await parseFile(file);
      const found = detectIssues(parsed);

      // 1. Try Gemini first
      setStatus("✦ Gemini is mapping your columns…");
      let geminiWorked = false;
      try {
        const res = await fetch("/api/map-columns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ columns: parsed.columns.map((c) => ({ key: c.key, sample: c.sample })) }),
        });
        if (res.ok) {
          const { mapping } = await res.json() as { mapping: Record<string, string> };
          parsed.columns = parsed.columns.map((c) => ({
            ...c,
            mappedAs: (mapping[c.key] && mapping[c.key] !== "other") ? mapping[c.key] : c.mappedAs,
            aiSuggested: !!(mapping[c.key] && mapping[c.key] !== "other"),
          }));
          geminiWorked = true;
        }
      } catch { /* fall through to dictionary */ }

      // 2. Fallback: dictionary match for any column still unmapped
      if (!geminiWorked) {
        setStatus("Applying column dictionary…");
        parsed.columns = parsed.columns.map((c) => {
          if (c.mappedAs) return c;
          const key = c.key.toLowerCase().trim();
          return { ...c, mappedAs: FALLBACK_MAP[key] ?? c.mappedAs };
        });
      }

      const mapped = parsed.columns.filter((c) => c.mappedAs && c.mappedAs !== "ignore").map((c) => `${c.key} → ${c.mappedAs}`);
      setMappedCols(mapped);
      setDataset(parsed);
      setIssues(found);
      setStatus(null);
      setStep(2);
    } catch (e) {
      setError((e as Error).message ?? "Could not parse file.");
      setStatus(null);
    }
  }

  function handleFixChange(id: string, fix: FixAction) {
    setIssues(issues.map((i) => (i.id === id ? { ...i, chosenFix: fix } : i)));
  }

  function handleGenerate() {
    if (!dataset) return;
    const result = applyFixes(dataset, issues);

    // Remap column names to canonical names before storing
    const remappedRows = result.rows.map((row) => {
      const newRow: Record<string, string> = {};
      dataset.columns.forEach((col) => {
        const target = col.mappedAs && col.mappedAs !== "ignore" ? col.mappedAs : col.key;
        newRow[target] = row[col.key] ?? "";
      });
      if (row._status) newRow._status = row._status;
      return newRow;
    });

    sessionStorage.setItem("rgc_mode", "custom");
    sessionStorage.setItem("rgc_dataset", JSON.stringify(remappedRows));
    sessionStorage.setItem("rgc_columns", JSON.stringify(dataset.columns));
    sessionStorage.setItem("rgc_views", JSON.stringify(selectedViews));
    sessionStorage.setItem("rgc_fixlog", JSON.stringify(result.fixLog));
    router.push("/overview");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">

      {/* ── Step 1: Landing ── */}
      {step === 1 && (
        <>
          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
              style={{ background: "linear-gradient(135deg,#1D1B84,#5A67D8,#C061B9)" }}>⬡</div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Welcome to RGC Dashboard</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Upload any CSV or JSON dataset and we'll map it automatically. Or load the RGC demo to explore an example.
            </p>
          </div>

          {/* Demo button */}
          <button onClick={handleLoadDemo} disabled={demoLoading}
            className="w-full rounded-2xl p-5 mb-4 text-left transition-all"
            style={{ background: "linear-gradient(135deg,#1D1B84 0%,#5A67D8 60%,#C061B9 100%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">
                  {demoLoading ? "Loading…" : "✦ Load RGC demo dataset"}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                  130 video reviews · 9 brands · 38 products · full brand intelligence
                </p>
              </div>
              <span className="text-white text-xl">→</span>
            </div>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: "var(--color-card-border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or upload your own</span>
            <div className="flex-1 h-px" style={{ background: "var(--color-card-border)" }} />
          </div>

          {error && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: "#fee2e2", color: "#dc2626" }}>
              {error} <button className="ml-2 underline text-xs" onClick={() => setError(null)}>dismiss</button>
            </div>
          )}

          <DropZone onFile={handleFile} loading={!!status} />

          {status && (
            <p className="text-center text-xs mt-3" style={{ color: "var(--color-rgc-electric)" }}>{status}</p>
          )}
          <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Columns auto-detected by Gemini AI · data stays in your browser
          </p>
        </>
      )}

      {/* Step indicator (steps 2–3) */}
      {step > 1 && (
        <div className="flex items-center gap-2 mb-8">
          {STEP_LABELS.map((label, i) => {
            const s = (i + 1) as Step;
            const active = s === step;
            const done = s < step;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: done ? "#dcfce7" : active ? "var(--color-rgc-electric)" : "#f1f5f9", color: done ? "#15803d" : active ? "white" : "var(--text-muted)" }}>
                  {done ? "✓" : s} {label}
                </div>
                {i < STEP_LABELS.length - 1 && <div className="w-6 h-px" style={{ background: "var(--color-card-border)" }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Step 2: Review data (clean only) ── */}
      {step === 2 && dataset && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Review data</h1>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: "#f1f5f9", color: "var(--text-muted)" }}>
              {dataset.rowCount} rows · {dataset.fileName}
            </span>
          </div>

          {/* Column mapping summary */}
          {mappedCols.length > 0 && (
            <div className="mb-4 rounded-xl px-4 py-3 text-xs" style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#854d0e" }}>
              <strong>✦ Columns auto-mapped:</strong>{" "}
              {mappedCols.join(" · ")}
            </div>
          )}

          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Review any data quality issues below. Fixes are non-destructive.
          </p>
          <CleanPanel issues={issues} onChange={handleFixChange} />

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="text-sm px-4 py-2 rounded-lg" style={{ color: "var(--text-muted)", background: "#f1f5f9" }}>← Back</button>
            <button onClick={() => setStep(3)} className="text-sm px-5 py-2 rounded-lg font-semibold text-white" style={{ background: "var(--color-rgc-electric)" }}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Choose views ── */}
      {step === 3 && (
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Choose your views</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Select how you want your data presented. You can change this any time.</p>
          <ViewPicker selected={selectedViews} onChange={setSelectedViews} />
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(2)} className="text-sm px-4 py-2 rounded-lg" style={{ color: "var(--text-muted)", background: "#f1f5f9" }}>← Back</button>
            <button onClick={handleGenerate} disabled={!selectedViews.length}
              className="text-sm px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,var(--color-rgc-blue),var(--color-rgc-electric))" }}>
              Generate dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
