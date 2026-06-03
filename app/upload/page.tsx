"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DropZone } from "@/components/upload/DropZone";
import { ColumnPreview } from "@/components/upload/ColumnPreview";
import { CleanPanel } from "@/components/upload/CleanPanel";
import { ViewPicker, ViewOption } from "@/components/upload/ViewPicker";
import { parseFile, ParsedDataset } from "@/lib/parser";
import { detectIssues, applyFixes, DataIssue, FixAction } from "@/lib/cleaner";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ["Upload", "Preview & Map", "Clean", "Choose Views"];

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [issues, setIssues] = useState<DataIssue[]>([]);
  const [selectedViews, setSelectedViews] = useState<ViewOption[]>(["bar", "pie", "table", "ai"]);

  // ── Step 1: parse file ─────────────────────────────────────────────────
  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const parsed = await parseFile(file);
      const found = detectIssues(parsed);
      setDataset(parsed);
      setIssues(found);
      setStep(2);
    } catch (e) {
      setError((e as Error).message ?? "Could not parse file. Please check the format.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: update column mapping ─────────────────────────────────────
  function handleMapping(key: string, mappedAs: string) {
    if (!dataset) return;
    setDataset({
      ...dataset,
      columns: dataset.columns.map((c) =>
        c.key === key ? { ...c, mappedAs } : c
      ),
    });
  }

  // ── Step 3: update fix choice ─────────────────────────────────────────
  function handleFixChange(id: string, fix: FixAction) {
    setIssues(issues.map((i) => (i.id === id ? { ...i, chosenFix: fix } : i)));
  }

  // ── Step 4: apply fixes & navigate ───────────────────────────────────
  function handleGenerate() {
    if (!dataset) return;
    const result = applyFixes(dataset, issues);
    // Store in sessionStorage so the dashboard can read it
    sessionStorage.setItem("rgc_dataset", JSON.stringify(result.rows));
    sessionStorage.setItem("rgc_columns", JSON.stringify(dataset.columns));
    sessionStorage.setItem("rgc_views", JSON.stringify(selectedViews));
    sessionStorage.setItem("rgc_fixlog", JSON.stringify(result.fixLog));
    router.push("/");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => {
          const s = (i + 1) as Step;
          const active = s === step;
          const done = s < step;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: done ? "#dcfce7" : active ? "var(--color-rgc-electric)" : "#f1f5f9",
                  color: done ? "#15803d" : active ? "white" : "var(--text-muted)",
                }}
              >
                {done ? "✓" : s} {label}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="w-6 h-px" style={{ background: "var(--color-card-border)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: "#fee2e2", color: "#dc2626" }}>
          {error}
          <button className="ml-3 underline text-xs" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      {/* ── Step 1: Upload ── */}
      {step === 1 && (
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Upload your dataset</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Supports CSV and JSON · columns are auto-detected
          </p>
          <DropZone onFile={handleFile} loading={loading} />
        </div>
      )}

      {/* ── Step 2: Preview & Map ── */}
      {step === 2 && dataset && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Preview &amp; Map</h1>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: "#f1f5f9", color: "var(--text-muted)" }}>
              {dataset.rowCount} rows · {dataset.columns.length} columns · {dataset.fileName}
            </span>
          </div>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Confirm column types. Map any unknown columns before proceeding.
          </p>
          <ColumnPreview columns={dataset.columns} onChange={handleMapping} />

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="text-sm px-4 py-2 rounded-lg" style={{ color: "var(--text-muted)", background: "#f1f5f9" }}>
              ← Re-upload
            </button>
            <button
              onClick={() => setStep(3)}
              className="text-sm px-5 py-2 rounded-lg font-semibold text-white transition-opacity"
              style={{ background: "var(--color-rgc-electric)" }}
            >
              Confirm →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Clean ── */}
      {step === 3 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Data quality</h1>
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{
                background: issues.length ? "#fee2e2" : "#dcfce7",
                color: issues.length ? "#dc2626" : "#15803d",
              }}
            >
              {issues.length ? `${issues.length} issue${issues.length > 1 ? "s" : ""} found` : "All clean"}
            </span>
          </div>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Review and choose how to handle each issue. Fixes are non-destructive — original file is untouched.
          </p>
          <CleanPanel issues={issues} onChange={handleFixChange} />

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(2)} className="text-sm px-4 py-2 rounded-lg" style={{ color: "var(--text-muted)", background: "#f1f5f9" }}>
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="text-sm px-5 py-2 rounded-lg font-semibold text-white"
              style={{ background: "var(--color-rgc-electric)" }}
            >
              Apply &amp; continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Choose views ── */}
      {step === 4 && (
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Choose your views</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Select how you want your data presented. You can change this from the dashboard at any time.
          </p>
          <ViewPicker selected={selectedViews} onChange={setSelectedViews} />

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(3)} className="text-sm px-4 py-2 rounded-lg" style={{ color: "var(--text-muted)", background: "#f1f5f9" }}>
              ← Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={!selectedViews.length}
              className="text-sm px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50 transition-opacity"
              style={{ background: "linear-gradient(135deg, var(--color-rgc-blue), var(--color-rgc-electric))" }}
            >
              Generate dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
