"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/StatCard";
import { ViewHotbar } from "@/components/ViewHotbar";
import { RatingBarChart } from "@/components/charts/RatingBarChart";
import { SentimentPie } from "@/components/charts/SentimentPie";
import { RatingLineChart } from "@/components/charts/RatingLineChart";
import { ReviewTable } from "@/components/charts/ReviewTable";
import { computeStats } from "@/lib/data";
import { ViewOption } from "@/components/upload/ViewPicker";

type Stats = ReturnType<typeof computeStats>;

export default function OverviewPage() {
  const router = useRouter();
  const [rows, setRows]             = useState<Record<string, string>[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [fixLog, setFixLog]         = useState<string[]>([]);
  const [availableViews, setAvailableViews] = useState<ViewOption[]>([]);
  const [activeView, setActiveView] = useState<ViewOption>("bar");

  useEffect(() => {
    const raw = sessionStorage.getItem("rgc_dataset");
    if (!raw) return;

    const parsed: Record<string, string>[] = JSON.parse(raw);
    setRows(parsed);
    setFixLog(JSON.parse(sessionStorage.getItem("rgc_fixlog") ?? "[]"));

    const views: ViewOption[] = JSON.parse(sessionStorage.getItem("rgc_views") ?? '["bar","pie","table","ai"]');
    setAvailableViews(views);
    setActiveView(views[0] ?? "bar");

    const uniqueProducts  = [...new Set(parsed.map((r) => r.product_name ?? r.product ?? ""))].filter(Boolean);
    const uniqueReviewers = [...new Set(parsed.map((r) => r.reviewer_id ?? r.reviewer ?? ""))].filter(Boolean);
    const ratings = parsed.map((r) => parseFloat(r.rating ?? "0")).filter((n) => !isNaN(n));

    setStats({
      totalProducts:  uniqueProducts.length,
      totalReviews:   parsed.length,
      totalReviewers: uniqueReviewers.length,
      averageRating:  ratings.length
        ? Math.round((ratings.reduce((s, n) => s + n, 0) / ratings.length) * 10) / 10
        : 0,
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    });
  }, []);

  const chartTitle: Record<ViewOption, string> = {
    bar:     "Average rating by product",
    pie:     "Sentiment breakdown",
    line:    "Rating over time",
    table:   "All reviews",
    heatmap: "Reviewer × product heatmap",
    ai:      "AI Insights",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Overview</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Product &amp; reviewer insights — Really Good Culture assessment
          </p>
        </div>
        <button
          onClick={() => router.push("/upload")}
          className="text-xs px-3 py-2 rounded-lg font-medium"
          style={{ background: "var(--color-rgc-electric)", color: "white" }}
        >
          ⬆ Upload new dataset
        </button>
      </div>

      {stats ? (
        <>
          {/* Fix log */}
          {fixLog.length > 0 && (
            <div className="mb-5 rounded-xl px-4 py-3 text-xs" style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#854d0e" }}>
              <strong>Data fixes applied:</strong> {fixLog.join(" · ")}
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            <StatCard title="Total Reviews"   value={stats.totalReviews}            accent="var(--color-rgc-blue)"     delta={`${rows.length} rows`} />
            <StatCard title="Total Products"  value={stats.totalProducts}           accent="var(--color-rgc-electric)" />
            <StatCard title="Total Reviewers" value={stats.totalReviewers}          accent="var(--color-rgc-teal)" />
            <StatCard title="Avg Rating"      value={`${stats.averageRating} / 5`}  accent="var(--color-rgc-orchid)" />
          </div>

          {/* Hotbar + chart */}
          {availableViews.length > 0 && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}
            >
              {/* Hotbar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {chartTitle[activeView]}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {rows.length} rows
                  </p>
                </div>
                <ViewHotbar
                  available={availableViews}
                  active={activeView}
                  onChange={setActiveView}
                  onAdd={(v) => {
                    const updated = [...availableViews, v];
                    setAvailableViews(updated);
                    setActiveView(v);
                    sessionStorage.setItem("rgc_views", JSON.stringify(updated));
                  }}
                />
              </div>

              {/* Chart area */}
              {activeView === "bar"  && <RatingBarChart rows={rows} />}
              {activeView === "pie"  && <SentimentPie   rows={rows} />}
              {activeView === "line" && <RatingLineChart rows={rows} />}
              {activeView === "table"&& <ReviewTable    rows={rows} />}
              {activeView === "ai"   && (
                <div className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>
                  Go to <strong>AI Insights</strong> in the sidebar to run Gemini analysis
                </div>
              )}
              {activeView === "heatmap" && (
                <div className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>
                  Heatmap coming soon
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div
          className="rounded-2xl border-2 border-dashed p-16 text-center"
          style={{ borderColor: "var(--color-card-border)" }}
        >
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg,#1D1B84,#5A67D8,#C061B9)" }}
          >
            ⬆
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
            No dataset loaded yet
          </p>
          <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
            Upload your CSV or JSON file to get started
          </p>
          <button
            onClick={() => router.push("/upload")}
            className="text-sm px-5 py-2 rounded-lg font-semibold text-white"
            style={{ background: "var(--color-rgc-electric)" }}
          >
            Upload dataset →
          </button>
        </div>
      )}
    </div>
  );
}
