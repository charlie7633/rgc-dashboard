"use client";

import { useState } from "react";
import { STATIC_INSIGHTS, BrandInsight } from "@/lib/static-insights";

const BRANDS = ["Double Dutch", "Fix8", "SKIP", "UNAI"];
const BRAND_COLOURS: Record<string, string> = {
  "Double Dutch": "#5A67D8", "Fix8": "#C061B9", "SKIP": "#4EA4B5", "UNAI": "#E289C1",
};

export default function InsightsPage() {
  const [selected, setSelected] = useState<string>("Fix8");
  const [enhanced, setEnhanced] = useState<Record<string, BrandInsight>>({});
  const [loading, setLoading] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<"idle" | "loading" | "done" | "failed">("idle");

  const current: BrandInsight = enhanced[selected] ?? STATIC_INSIGHTS[selected];

  async function runGemini(brand: string) {
    if (enhanced[brand]) return;
    setLoading(true);
    setGeminiStatus("loading");
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setEnhanced((prev) => ({ ...prev, [brand]: { ...STATIC_INSIGHTS[brand], ...data.analysis, reviewCount: data.reviewCount } }));
      setGeminiStatus("done");
    } catch {
      setGeminiStatus("failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>AI Insights</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Consumer signals extracted from 130 video review transcripts · 4 reviewed brands
          </p>
        </div>
        <button
          onClick={() => runGemini(selected)}
          disabled={loading || !!enhanced[selected]}
          className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition-all"
          style={{ background: "linear-gradient(135deg,#1D1B84,#5A67D8,#C061B9)", color: "white" }}
        >
          {loading ? "Analysing…" : enhanced[selected] ? "✓ Gemini enhanced" : "✦ Enhance with Gemini"}
        </button>
      </div>

      {geminiStatus === "done" && (
        <div className="mb-4 rounded-xl px-4 py-3 text-xs" style={{ background: "#dcfce7", border: "1px solid #bbf7d0", color: "#15803d" }}>
          ✦ Gemini analysis complete — insights updated with live AI analysis
        </div>
      )}

      {/* Brand tabs */}
      <div className="flex gap-2 mb-6">
        {BRANDS.map((brand) => {
          const active = selected === brand;
          const insight = STATIC_INSIGHTS[brand];
          return (
            <button key={brand} onClick={() => { setSelected(brand); setGeminiStatus("idle"); }}
              className="flex-1 rounded-xl p-4 text-left transition-all"
              style={{
                background: active ? "#eef2ff" : "var(--color-card)",
                border: active ? `2px solid ${BRAND_COLOURS[brand]}` : "1px solid var(--color-card-border)",
              }}>
              <div className="flex items-center justify-between mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND_COLOURS[brand] }} />
                <span className="text-xs font-black" style={{ color: BRAND_COLOURS[brand] }}>{insight.overallScore}/10</span>
              </div>
              <p className="text-sm font-bold" style={{ color: active ? BRAND_COLOURS[brand] : "var(--text-primary)" }}>{brand}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{insight.reviewCount} reviews · {insight.wouldBuyAfterRate}% buy↑</p>
            </button>
          );
        })}
      </div>

      {/* Main insight card */}
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-2xl p-6 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg,${BRAND_COLOURS[selected]}18,${BRAND_COLOURS[selected]}06)`, border: `1px solid ${BRAND_COLOURS[selected]}40` }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: BRAND_COLOURS[selected] }}>{selected}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {current.reviewCount} video reviews · avg {current.avgRating}/5 · {current.wouldBuyAfterRate}% buy after trying
            </p>
            {/* Intent gap callout */}
            <div className="mt-2 inline-flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: current.intentGap > 40 ? "#fee2e2" : current.intentGap > 30 ? "#fefce8" : "#dcfce7", color: current.intentGap > 40 ? "#dc2626" : current.intentGap > 30 ? "#854d0e" : "#15803d" }}>
                {current.intentGap}pp discovery gap
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {current.wouldBuyAfterRate}% buy after trying vs {current.wouldBuyFirstRate}% buy in first place
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black" style={{ color: BRAND_COLOURS[selected] }}>{current.overallScore}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>/ 10 score</div>
          </div>
        </div>

        {/* Themes + signals + concerns */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>Top themes</p>
            <div className="flex flex-wrap gap-2">
              {current.topThemes.map((theme, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: `${BRAND_COLOURS[selected]}18`, color: BRAND_COLOURS[selected] }}>
                  {theme}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#15803d" }}>✓ Positive signals</p>
            <ul className="space-y-2">
              {current.positiveSignals.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  <span className="shrink-0 mt-0.5" style={{ color: "#15803d" }}>●</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#dc2626" }}>⚠ Concerns</p>
            <ul className="space-y-2">
              {current.concerns.map((c, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  <span className="shrink-0 mt-0.5" style={{ color: "#dc2626" }}>●</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Standout quote */}
        <div className="rounded-xl p-5" style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#854d0e" }}>✦ Representative voice</p>
          <p className="text-sm italic leading-relaxed" style={{ color: "#92400e" }}>"{current.standoutQuote}"</p>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Purchase intent analysis</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{current.purchaseIntentInsight}</p>
          </div>
          <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Audience profile</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{current.audienceProfile}</p>
          </div>
          <div className="rounded-xl p-5" style={{ background: "#eef2ff", border: "1px solid #c7d2fe" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#4338ca" }}>Commercial opportunity</p>
            <p className="text-xs leading-relaxed" style={{ color: "#3730a3" }}>{current.commercialOpportunity}</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="rounded-xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
          <div className="flex justify-between text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            <span>Overall sentiment score</span>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{current.overallScore} / 10</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "#f1f5f9" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${current.overallScore * 10}%`, background: `linear-gradient(90deg,${BRAND_COLOURS[selected]},${BRAND_COLOURS[selected]}88)` }} />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            <span>Sentiment · purchase intent · theme quality</span>
            <span>{enhanced[selected] ? "✦ Gemini live" : "✦ AI-derived"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
