"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/StatCard";
import { ViewHotbar } from "@/components/ViewHotbar";
import { RatingBarChart } from "@/components/charts/RatingBarChart";
import { SentimentPie } from "@/components/charts/SentimentPie";
import { RatingLineChart } from "@/components/charts/RatingLineChart";
import { ReviewTable } from "@/components/charts/ReviewTable";
import { ViewOption } from "@/components/upload/ViewPicker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Brand {
  name: string; breakthroughScore: number; momentumScore: number;
  transcriptCount: number; avgRating: number; wouldBuyAfterRate: number;
  wouldBuyFirstRate: number; hasTranscripts: boolean; productCount: number;
  sentimentBreakdown: Record<string, number>;
}

const BRAND_COLOURS: Record<string, string> = {
  "Double Dutch": "#5A67D8", "Fix8": "#C061B9", "SKIP": "#4EA4B5", "UNAI": "#E289C1",
};

export default function OverviewPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"demo" | "custom" | null>(null);

  // Demo mode state
  const [brands, setBrands] = useState<Brand[]>([]);

  // Custom mode state
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fixLog, setFixLog] = useState<string[]>([]);
  const [availableViews, setAvailableViews] = useState<ViewOption[]>([]);
  const [activeView, setActiveView] = useState<ViewOption>("bar");

  useEffect(() => {
    const m = sessionStorage.getItem("rgc_mode") as "demo" | "custom" | null;
    if (!m) { router.replace("/upload"); return; }
    setMode(m);

    if (m === "demo") {
      fetch("/api/brands").then((r) => r.json()).then(setBrands);
    } else {
      const raw = sessionStorage.getItem("rgc_dataset");
      if (!raw) { router.replace("/upload"); return; }
      const parsed = JSON.parse(raw);
      setRows(parsed);
      setFixLog(JSON.parse(sessionStorage.getItem("rgc_fixlog") ?? "[]"));
      const views: ViewOption[] = JSON.parse(sessionStorage.getItem("rgc_views") ?? '["bar","pie","table","ai"]');
      setAvailableViews(views);
      setActiveView(views[0] ?? "bar");
    }
  }, [router]);

  // ── Demo mode view ──────────────────────────────────────────────────────
  if (mode === "demo") {
    const reviewed = brands.filter((b) => b.hasTranscripts);
    const totalReviews = brands.reduce((s, b) => s + b.transcriptCount, 0);
    const overallAvgRating = reviewed.length
      ? (reviewed.reduce((s, b) => s + b.avgRating * b.transcriptCount, 0) / (totalReviews || 1)).toFixed(1) : "—";
    const overallBuyAfter = reviewed.length
      ? Math.round(reviewed.reduce((s, b) => s + b.wouldBuyAfterRate * b.transcriptCount, 0) / (totalReviews || 1)) : 0;

    const btsData = brands.map((b) => ({ name: b.name, score: +b.breakthroughScore.toFixed(1), hasTranscripts: b.hasTranscripts }))
      .sort((a, b) => b.score - a.score);

    return (
      <div className="p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Overview</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              4 brands were sent to real consumers for video review · 5 additional brands are included as competitors for comparison · 130 reviews total
            </p>
          </div>
          <button onClick={() => { sessionStorage.clear(); router.push("/upload"); }}
            className="text-xs px-3 py-2 rounded-lg font-medium"
            style={{ background: "#f1f5f9", color: "var(--text-muted)" }}>
            ⬆ Change dataset
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard title="Video Reviews" value={totalReviews} accent="var(--color-rgc-blue)" subtitle="real consumer video reviews across 4 brands" />
          <StatCard title="Products in Dataset" value={brands.reduce((s, b) => s + b.productCount, 0)} accent="var(--color-rgc-electric)" subtitle="across all 9 brands (4 reviewed + 5 competitors)" />
          <StatCard title="Avg Rating" value={`${overallAvgRating} / 5`} accent="var(--color-rgc-teal)" subtitle="average score left by reviewers (out of 5)" />
          <StatCard title="Would Buy Again" value={`${overallBuyAfter}%`} accent="var(--color-rgc-orchid)" subtitle="of reviewers said they'd buy after trying" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Breakthrough Score — all 9 brands</p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>How fast-growing and well-known each brand is (0–100). Higher = more momentum.</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
              {Object.entries(BRAND_COLOURS).map(([brand, colour]) => (
                <span key={brand} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: colour }} />
                  {brand} <span style={{ color: "#94a3b8" }}>(reviewed)</span>
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-200" />
                Grey = competitor brand (no consumer reviews — included for comparison only)
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={btsData} margin={{ top: 0, right: 8, left: -16, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis domain={[0, 60]} ticks={[0, 20, 40, 60]} tick={{ fontSize: 9, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [v, "Breakthrough Score"]} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {btsData.map((entry, i) => (
                    <Cell key={`bts-${entry.name}`} fill={entry.hasTranscripts ? (BRAND_COLOURS[entry.name] ?? "#5A67D8") : "#e2e8f0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Reviewed brands at a glance</p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>How each reviewed brand performed across all consumer video reviews</p>
            {/* Column headers */}
            <div className="flex items-center gap-3 mb-2 px-0">
              <div className="w-2.5 shrink-0" />
              <span className="text-xs w-28 shrink-0" style={{ color: "var(--text-muted)" }}></span>
              <span className="flex-1 text-xs" style={{ color: "var(--text-muted)" }}>% positive reviews</span>
              <span className="text-xs w-8 text-right shrink-0" style={{ color: "var(--text-muted)" }}>pos.</span>
              <span className="text-xs w-10 text-right shrink-0" style={{ color: "var(--text-muted)" }}>rating</span>
              <span className="text-xs w-14 text-right shrink-0" style={{ color: "var(--text-muted)" }}>buy again</span>
            </div>
            <div className="space-y-3">
              {reviewed.map((b) => {
                const pos = b.sentimentBreakdown["POSITIVE"] ?? 0;
                const posPct = Math.round((pos / b.transcriptCount) * 100);
                return (
                  <div key={b.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: BRAND_COLOURS[b.name] }} />
                    <span className="text-sm font-medium w-28 shrink-0" style={{ color: "var(--text-secondary)" }}>{b.name}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                      <div className="h-full rounded-full" style={{ width: `${posPct}%`, background: BRAND_COLOURS[b.name] }} />
                    </div>
                    <span className="text-xs w-8 text-right shrink-0 font-medium" style={{ color: BRAND_COLOURS[b.name] }}>{posPct}%</span>
                    <span className="text-xs w-10 text-right shrink-0" style={{ color: "var(--text-muted)" }}>⭐{b.avgRating}</span>
                    <span className="text-xs w-14 text-right shrink-0" style={{ color: "var(--text-muted)" }}>{b.wouldBuyAfterRate}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl p-3" style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "#854d0e" }}>✦ Key insight</p>
              <p className="text-sm leading-relaxed" style={{ color: "#92400e" }}>
                Trip (competitor) leads with BTS 45.1 — above all reviewed brands. Fix8 has the most reviews (45) yet scores below Trip and DASH, suggesting a discovery gap despite strong consumer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Custom upload mode view ─────────────────────────────────────────────
  if (mode === "custom") {
    // Flexible column resolution
    const PROD_KEYS = ["product_name","product","productName","name","item","category","Product Category","brand"];
    const REV_KEYS  = ["reviewer_id","reviewer","user_id","Customer ID","customer_id","personId","email","user"];
    const RATE_KEYS = ["rating","score","stars","review_score","avg_rating"];
    const NUM_KEYS  = ["rating","score","price","Price per Unit","quantity","Quantity","Total Amount","total_amount","amount"];

    function col(row: Record<string, string>, ...keys: string[]) {
      for (const k of keys) if (row[k] !== undefined && row[k] !== "") return row[k];
      return "";
    }

    const uniqueProducts  = [...new Set(rows.map((r) => col(r, ...PROD_KEYS)))].filter(Boolean);
    const uniqueReviewers = [...new Set(rows.map((r) => col(r, ...REV_KEYS)))].filter(Boolean);

    // Try rating first, fall back to first available numeric column
    const ratingKey = RATE_KEYS.find((k) => rows.some((r) => !isNaN(parseFloat(r[k])) && parseFloat(r[k]) > 0));
    const numKey    = ratingKey ?? NUM_KEYS.find((k) => rows.some((r) => !isNaN(parseFloat(r[k])) && parseFloat(r[k]) > 0));
    const nums      = numKey ? rows.map((r) => parseFloat(r[numKey] ?? "0")).filter((n) => !isNaN(n) && n > 0) : [];
    const isRating  = !!ratingKey;
    const avgRating = nums.length ? (nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(isRating ? 1 : 0) : "—";
    const avgLabel  = numKey && !isRating ? `Avg ${numKey}` : "Avg Rating";

    const chartTitle: Record<ViewOption, string> = {
      bar: "Average rating by product", pie: "Sentiment breakdown",
      line: "Rating over time", table: "All reviews", heatmap: "Heatmap", ai: "AI Insights",
    };

    return (
      <div className="p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Overview</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Custom dataset · {rows.length} rows</p>
          </div>
          <button onClick={() => { sessionStorage.clear(); router.push("/upload"); }}
            className="text-xs px-3 py-2 rounded-lg font-medium"
            style={{ background: "#f1f5f9", color: "var(--text-muted)" }}>
            ⬆ Change dataset
          </button>
        </div>

        {fixLog.length > 0 && (
          <div className="mb-5 rounded-xl px-4 py-3 text-xs" style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#854d0e" }}>
            <strong>Data fixes applied:</strong> {fixLog.join(" · ")}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Rows"        value={rows.length}            accent="var(--color-rgc-blue)" />
          <StatCard title="Unique Products"   value={uniqueProducts.length}  accent="var(--color-rgc-electric)" subtitle={uniqueProducts.length === 0 ? "no product col" : undefined} />
          <StatCard title="Unique Reviewers"  value={uniqueReviewers.length} accent="var(--color-rgc-teal)" />
          <StatCard title={avgLabel}          value={isRating ? `${avgRating} / 5` : avgRating} accent="var(--color-rgc-orchid)" />
        </div>

        {availableViews.length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{chartTitle[activeView]}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{rows.length} rows</p>
              </div>
              <ViewHotbar available={availableViews} active={activeView} onChange={setActiveView}
                onAdd={(v) => { const u = [...availableViews, v]; setAvailableViews(u); setActiveView(v); sessionStorage.setItem("rgc_views", JSON.stringify(u)); }} />
            </div>
            {activeView === "bar"   && <RatingBarChart rows={rows} />}
            {activeView === "pie"   && <SentimentPie rows={rows} />}
            {activeView === "line"  && <RatingLineChart rows={rows} />}
            {activeView === "table" && <ReviewTable rows={rows} />}
            {(activeView === "ai" || activeView === "heatmap") && (
              <div className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>
                {activeView === "ai" ? "Go to AI Insights in the sidebar" : "Heatmap coming soon"}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
