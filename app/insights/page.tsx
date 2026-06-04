"use client";

import { useState } from "react";

const BRANDS = ["Double Dutch", "Fix8", "SKIP", "UNAI"];
const BRAND_COLOURS: Record<string, string> = {
  "Double Dutch": "#5A67D8", "Fix8": "#C061B9", "SKIP": "#4EA4B5", "UNAI": "#E289C1",
};

interface Analysis {
  topThemes: string[];
  positiveSignals: string[];
  concerns: string[];
  purchaseIntentInsight: string;
  audienceProfile: string;
  standoutQuote: string;
  commercialOpportunity: string;
  overallScore: number;
}

interface InsightResult {
  brand: string;
  reviewCount: number;
  analysis: Analysis;
}

export default function InsightsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, InsightResult>>({});
  const [error, setError] = useState<string | null>(null);

  async function runInsights(brand: string) {
    if (results[brand]) { setSelected(brand); return; } // cached
    setSelected(brand);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: InsightResult = await res.json();
      setResults((prev) => ({ ...prev, [brand]: data }));
    } catch (e) {
      setError(`Analysis failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  const current = selected ? results[selected] : null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>AI Insights</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Gemini analysis of reviewer transcripts · select a brand to run
        </p>
      </div>

      {/* Brand selector */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {BRANDS.map((brand) => {
          const done = !!results[brand];
          const active = selected === brand;
          return (
            <button key={brand} onClick={() => runInsights(brand)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: active ? "#eef2ff" : "var(--color-card)",
                border: active ? `2px solid ${BRAND_COLOURS[brand]}` : "1px solid var(--color-card-border)",
              }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: BRAND_COLOURS[brand] }} />
                {done && <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#dcfce7", color: "#15803d" }}>✓ done</span>}
                {loading && active && !done && <span className="text-xs" style={{ color: "var(--text-muted)" }}>…</span>}
              </div>
              <p className="text-sm font-bold" style={{ color: active ? BRAND_COLOURS[brand] : "var(--text-primary)" }}>{brand}</p>
              {done && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Score: {results[brand].analysis.overallScore}/10</p>}
              {!done && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Click to analyse</p>}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: "#fee2e2", color: "#dc2626" }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && selected && !current && (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
          <div className="text-3xl mb-3">✦</div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Gemini is analysing {selected} transcripts…
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Reading {BRANDS.indexOf(selected) === 0 ? 35 : BRANDS.indexOf(selected) === 1 ? 45 : BRANDS.indexOf(selected) === 2 ? 25 : 25} reviews · this takes ~10 seconds
          </p>
        </div>
      )}

      {/* Results */}
      {current && (
        <div className="space-y-4">
          {/* Header */}
          <div className="rounded-2xl p-6 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${BRAND_COLOURS[current.brand]}18, ${BRAND_COLOURS[current.brand]}08)`, border: `1px solid ${BRAND_COLOURS[current.brand]}40` }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: BRAND_COLOURS[current.brand] }}>{current.brand}</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Based on {current.reviewCount} video reviews · Gemini 2.0 Flash
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black" style={{ color: BRAND_COLOURS[current.brand] }}>
                {current.analysis.overallScore}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>/ 10 sentiment</div>
            </div>
          </div>

          {/* Themes + signals row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Top themes */}
            <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>Top themes</p>
              <div className="flex flex-wrap gap-2">
                {current.analysis.topThemes.map((theme, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: `${BRAND_COLOURS[current.brand]}18`, color: BRAND_COLOURS[current.brand] }}>
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Positive signals */}
            <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#15803d" }}>✓ Positive signals</p>
              <ul className="space-y-2">
                {current.analysis.positiveSignals.map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "#15803d" }}>●</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#dc2626" }}>⚠ Concerns</p>
              <ul className="space-y-2">
                {current.analysis.concerns.map((c, i) => (
                  <li key={i} className="flex gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "#dc2626" }}>●</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Standout quote */}
          <div className="rounded-xl p-5" style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#854d0e" }}>✦ Standout quote</p>
            <p className="text-sm italic leading-relaxed" style={{ color: "#92400e" }}>"{current.analysis.standoutQuote}"</p>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Purchase intent</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{current.analysis.purchaseIntentInsight}</p>
            </div>
            <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Audience profile</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{current.analysis.audienceProfile}</p>
            </div>
            <div className="rounded-xl p-5" style={{ background: "#eef2ff", border: "1px solid #c7d2fe" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#4338ca" }}>Commercial opportunity</p>
              <p className="text-sm leading-relaxed" style={{ color: "#3730a3" }}>{current.analysis.commercialOpportunity}</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
            <div className="flex justify-between text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              <span>Overall sentiment score</span>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{current.analysis.overallScore} / 10</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "#f1f5f9" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${current.analysis.overallScore * 10}%`, background: `linear-gradient(90deg, ${BRAND_COLOURS[current.brand]}, ${BRAND_COLOURS[current.brand]}aa)` }} />
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selected && !loading && (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--color-card)", border: "2px dashed var(--color-card-border)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Select a brand above to run Gemini analysis</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Analyses themes, sentiment, purchase intent, and commercial opportunities from reviewer transcripts
          </p>
        </div>
      )}
    </div>
  );
}
