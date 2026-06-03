"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Transcript {
  reviewId: string; brand: string; productName: string; createdAt: string;
  rating: number; sentiment: string; summary: string; wordCount: number;
  wouldBuyAfter: boolean; wouldBuyFirst: boolean; isFeatured: boolean;
  challengeTitle: string | null; text: string;
  user: { firstName: string; lastName: string; age: string; gender: string; region: string; tier: string; primaryArchetype: string; } | null;
}

const SENTIMENT_COLOURS: Record<string, string> = {
  POSITIVE: "#5A67D8", NEUTRAL: "#fbbf24", MIXED: "#fb923c", NEGATIVE: "#f87171", UNKNOWN: "#94a3b8"
};

const BRAND_FILTER_COLOURS: Record<string, string> = {
  "All": "#94a3b8", "Double Dutch": "#5A67D8", "Fix8": "#C061B9", "SKIP": "#4EA4B5", "UNAI": "#E289C1",
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="text-xs">
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ color: s <= rating ? "#fbbf24" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const [all, setAll] = useState<Transcript[]>([]);
  const [brandFilter, setBrandFilter] = useState("All");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/transcripts").then((r) => r.json()).then(setAll);
  }, []);

  const filtered = all.filter((t) => {
    if (brandFilter !== "All" && t.brand !== brandFilter) return false;
    if (sentimentFilter !== "All" && t.sentiment !== sentimentFilter) return false;
    if (search && !t.summary?.toLowerCase().includes(search.toLowerCase()) && !t.productName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Sentiment pie
  const sentimentCounts: Record<string, number> = {};
  all.forEach((t) => { sentimentCounts[t.sentiment] = (sentimentCounts[t.sentiment] ?? 0) + 1; });
  const pieData = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));

  // Purchase intent by brand
  const intentByBrand: Record<string, { after: number; first: number; total: number }> = {};
  all.forEach((t) => {
    if (!intentByBrand[t.brand]) intentByBrand[t.brand] = { after: 0, first: 0, total: 0 };
    intentByBrand[t.brand].total++;
    if (t.wouldBuyAfter) intentByBrand[t.brand].after++;
    if (t.wouldBuyFirst) intentByBrand[t.brand].first++;
  });
  const intentData = Object.entries(intentByBrand).map(([brand, v]) => ({
    brand,
    afterRate: Math.round((v.after / v.total) * 100),
    firstRate: Math.round((v.first / v.total) * 100),
  }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Transcripts</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {all.length} video reviews · 4 brands · spoken transcript + purchase intent data
        </p>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Sentiment distribution</p>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>AI-assigned · skews positive (solicited reviews)</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry) => <Cell key={`pie-${entry.name}`} fill={SENTIMENT_COLOURS[entry.name] ?? "#94a3b8"} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: SENTIMENT_COLOURS[d.name] }} />
                  {d.name}: <strong>{d.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Purchase intent by brand</p>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Would buy after trying vs. would buy in first place</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={intentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="brand" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} formatter={(v: number) => [`${v}%`]} />
              <Bar dataKey="afterRate" name="Buy after trying" fill="#5A67D8" radius={[3,3,0,0]} />
              <Bar dataKey="firstRate" name="Buy in first place" fill="#E289C1" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {["All", "Double Dutch", "Fix8", "SKIP", "UNAI"].map((b) => (
          <button key={b} onClick={() => setBrandFilter(b)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: brandFilter === b ? (BRAND_FILTER_COLOURS[b] ?? "#5A67D8") : "#f1f5f9",
              color: brandFilter === b ? "white" : "var(--text-muted)",
            }}>
            {b}
          </button>
        ))}
        <div className="w-px bg-slate-200" />
        {["All", "POSITIVE", "NEUTRAL", "MIXED", "NEGATIVE"].map((s) => (
          <button key={s} onClick={() => setSentimentFilter(s)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: sentimentFilter === s ? (SENTIMENT_COLOURS[s] ?? "#94a3b8") : "#f1f5f9",
              color: sentimentFilter === s ? "white" : "var(--text-muted)",
            }}>
            {s}
          </button>
        ))}
        <input type="text" placeholder="Search summaries…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-lg border text-xs"
          style={{ borderColor: "var(--color-card-border)", color: "var(--text-secondary)" }} />
      </div>

      {/* Review cards */}
      <div className="space-y-2">
        {filtered.slice(0, 50).map((t) => (
          <div key={t.reviewId} className="rounded-xl px-4 py-3 transition-all cursor-pointer"
            style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}
            onClick={() => setExpanded(expanded === t.reviewId ? null : t.reviewId)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: BRAND_FILTER_COLOURS[t.brand] ?? "#94a3b8", color: "white" }}>{t.brand}</span>
                  <span className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{t.productName}</span>
                  {t.isFeatured && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#fef9c3", color: "#854d0e" }}>Featured</span>}
                  {t.challengeTitle && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#eef2ff", color: "#4338ca" }}>{t.challengeTitle}</span>}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t.summary}</p>
                {expanded === t.reviewId && t.text && (
                  <p className="text-xs mt-3 p-3 rounded-lg leading-relaxed italic" style={{ background: "#f8fafc", color: "var(--text-muted)", border: "1px solid var(--color-card-border)" }}>
                    "{t.text.slice(0, 500)}{t.text.length > 500 ? "…" : ""}"
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right space-y-1">
                <RatingStars rating={t.rating} />
                <div>
                  <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: SENTIMENT_COLOURS[t.sentiment] + "22", color: SENTIMENT_COLOURS[t.sentiment] }}>
                    {t.sentiment}
                  </span>
                </div>
                <div className="flex gap-1 justify-end mt-1">
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: t.wouldBuyAfter ? "#dcfce7" : "#fee2e2", color: t.wouldBuyAfter ? "#15803d" : "#dc2626" }}>
                    {t.wouldBuyAfter ? "✓" : "✗"} buy after
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: t.wouldBuyFirst ? "#dcfce7" : "#fee2e2", color: t.wouldBuyFirst ? "#15803d" : "#dc2626" }}>
                    {t.wouldBuyFirst ? "✓" : "✗"} buy first
                  </span>
                </div>
                {t.user && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.user.firstName} · {t.user.tier?.replace("TIER_", "T")} · {t.wordCount}w</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>Showing {Math.min(filtered.length, 50)} of {filtered.length}</p>
    </div>
  );
}
