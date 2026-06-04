"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Legend,
} from "recharts";

interface Brand {
  name: string; founded: string; city: string; website: string;
  breakthroughScore: number; momentumScore: number; popularityScore: number;
  productCount: number; transcriptCount: number; hasTranscripts: boolean;
  avgRating: number; sentimentBreakdown: Record<string, number>;
  wouldBuyAfterRate: number; wouldBuyFirstRate: number;
  description: string; archetypeAffinity: string;
}

const BRAND_COLOURS: Record<string, string> = {
  "Double Dutch": "#5A67D8",
  "Fix8": "#C061B9",
  "SKIP": "#4EA4B5",
  "UNAI": "#E289C1",
  "Trip": "#94a3b8",
  "DASH": "#94a3b8",
  "Hip Pop": "#94a3b8",
  "Agua de Madre": "#94a3b8",
  "Dalston's": "#94a3b8",
};

function SentimentBar({ breakdown, total, showLegend = false }: { breakdown: Record<string, number>; total: number; showLegend?: boolean }) {
  const pos = breakdown["POSITIVE"] ?? 0;
  const neg = breakdown["NEGATIVE"] ?? 0;
  const neu = (breakdown["NEUTRAL"] ?? 0) + (breakdown["MIXED"] ?? 0);
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-2 w-full">
        <div style={{ width: `${(pos / total) * 100}%`, background: "#5A67D8" }} title={`Positive: ${pos}`} />
        <div style={{ width: `${(neu / total) * 100}%`, background: "#fbbf24" }} title={`Neutral/Mixed: ${neu}`} />
        <div style={{ width: `${(neg / total) * 100}%`, background: "#f87171" }} title={`Negative: ${neg}`} />
      </div>
      {showLegend && (
        <div className="flex gap-3 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <span style={{ color: "#5A67D8" }}>● Positive</span>
          <span style={{ color: "#fbbf24" }}>● Neutral</span>
          <span style={{ color: "#f87171" }}>● Negative</span>
        </div>
      )}
    </div>
  );
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selected, setSelected] = useState<Brand | null>(null);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then((d) => {
      setBrands(d);
      setSelected(d[0]);
    });
  }, []);

  const reviewed = brands.filter((b) => b.hasTranscripts);
  const competitors = brands.filter((b) => !b.hasTranscripts);

  const btsData = brands
    .map((b) => ({ name: b.name, breakthrough: +b.breakthroughScore.toFixed(1), momentum: +b.momentumScore.toFixed(1), popularity: +b.popularityScore.toFixed(1) }))
    .sort((a, b) => b.breakthrough - a.breakthrough);

  const radarData = selected ? [
    { metric: "Breakthrough", value: selected.breakthroughScore },
    { metric: "Momentum", value: selected.momentumScore },
    { metric: "Popularity", value: selected.popularityScore },
    { metric: "Avg Rating", value: selected.avgRating * 20 },
    { metric: "Buy After", value: selected.wouldBuyAfterRate },
    { metric: "Buy First", value: selected.wouldBuyFirstRate },
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Brands</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          4 reviewed brands · 5 competitive context brands · BTS scores [0–100]
        </p>
      </div>

      {/* BTS bar chart */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Breakthrough Score comparison</p>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>All 9 brands · grey = competitor (no transcript data)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={btsData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
            <YAxis domain={[0, 60]} ticks={[0, 20, 40, 60]} tick={{ fontSize: 10, fill: "#64748b" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="breakthrough" name="Breakthrough" radius={[4, 4, 0, 0]}
              fill="#5A67D8"
              label={false}
            />
            <Bar dataKey="momentum" name="Momentum" radius={[4, 4, 0, 0]} fill="#C061B9" />
            <Bar dataKey="popularity" name="Popularity" radius={[4, 4, 0, 0]} fill="#4EA4B5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Brand list */}
        <div className="col-span-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>Reviewed brands</p>
          {reviewed.map((b) => (
            <button key={b.name} onClick={() => setSelected(b)}
              className="w-full text-left rounded-xl px-4 py-3 transition-all"
              style={{
                background: selected?.name === b.name ? "#eef2ff" : "var(--color-card)",
                border: selected?.name === b.name ? "2px solid var(--color-rgc-electric)" : "1px solid var(--color-card-border)",
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND_COLOURS[b.name] ?? "#94a3b8" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{b.name}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: "var(--color-rgc-electric)" }}>{b.breakthroughScore.toFixed(1)}</span>
              </div>
              <div className="mt-2 flex gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                <span>{b.transcriptCount} reviews</span>
                <span>⭐ {b.avgRating}/5</span>
                <span>{b.wouldBuyAfterRate}% buy after</span>
              </div>
              {b.transcriptCount > 0 && (
                <div className="mt-2">
                  <SentimentBar breakdown={b.sentimentBreakdown} total={b.transcriptCount} showLegend />
                </div>
              )}
            </button>
          ))}

          <p className="text-xs font-semibold uppercase tracking-wide mt-5 mb-3" style={{ color: "var(--text-muted)" }}>Competitive context</p>
          {competitors.map((b) => (
            <button key={b.name} onClick={() => setSelected(b)}
              className="w-full text-left rounded-xl px-4 py-3 transition-all"
              style={{
                background: selected?.name === b.name ? "#f8fafc" : "var(--color-card)",
                border: selected?.name === b.name ? "1.5px solid #94a3b8" : "1px solid var(--color-card-border)",
                opacity: 0.85,
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{b.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{b.breakthroughScore.toFixed(1)}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{b.productCount} products · no transcripts</p>
            </button>
          ))}
        </div>

        {/* Brand detail */}
        {selected && (
          <div className="col-span-2 space-y-4">
            {/* Header card */}
            <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{selected.name}</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Founded {selected.founded} · {selected.city} · <a href={selected.website} target="_blank" className="underline" style={{ color: "var(--text-accent)" }}>{selected.website}</a></p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black" style={{ color: "var(--color-rgc-electric)" }}>{selected.breakthroughScore.toFixed(1)}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>Breakthrough Score</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{selected.description?.slice(0, 320)}…</p>
            </div>

            {/* Score cards + radar */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
                {[
                  { label: "Momentum Score",   val: selected.momentumScore,   max: 100, color: "#5A67D8" },
                  { label: "Popularity Score",  val: selected.popularityScore,  max: 100, color: "#C061B9" },
                  { label: "Buy after trying",  val: selected.wouldBuyAfterRate, max: 100, color: "#4EA4B5", suffix: "%" },
                  { label: "Buy in first place",val: selected.wouldBuyFirstRate, max: 100, color: "#E289C1", suffix: "%" },
                ].map(({ label, val, max, color, suffix }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      <span>{label}</span>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{val.toFixed(1)}{suffix ?? ""}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#f1f5f9" }}>
                      <div className="h-full rounded-full" style={{ width: `${(val / max) * 100}%`, background: color }} />
                    </div>
                  </div>
                ))}

                {selected.hasTranscripts && (
                  <div className="pt-2">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Sentiment breakdown</p>
                    <SentimentBar breakdown={selected.sentimentBreakdown} total={selected.transcriptCount} />
                    <div className="flex gap-3 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span style={{ color: "#5A67D8" }}>● {selected.sentimentBreakdown["POSITIVE"] ?? 0} positive</span>
                      <span style={{ color: "#fbbf24" }}>● {(selected.sentimentBreakdown["NEUTRAL"] ?? 0) + (selected.sentimentBreakdown["MIXED"] ?? 0)} neutral</span>
                      <span style={{ color: "#f87171" }}>● {selected.sentimentBreakdown["NEGATIVE"] ?? 0} negative</span>
                    </div>
                  </div>
                )}

                {!selected.hasTranscripts && (
                  <p className="text-xs pt-2" style={{ color: "var(--text-muted)" }}>
                    Competitive context only — no transcript data
                  </p>
                )}
              </div>

              <div className="rounded-xl p-4" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Performance radar</p>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                    <Radar dataKey="value" stroke="#5A67D8" fill="#5A67D8" fillOpacity={0.2} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Archetype affinity */}
            {selected.archetypeAffinity && (
              <div className="rounded-xl p-4" style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "#854d0e" }}>✦ Archetype affinity</p>
                <p className="text-xs leading-relaxed" style={{ color: "#92400e" }}>{selected.archetypeAffinity?.slice(0, 400)}…</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
