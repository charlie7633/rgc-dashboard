"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { DashboardStats } from "@/lib/types";

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Product &amp; reviewer insights — Really Good Culture assessment
        </p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading data...</p>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard title="Total Products" value={stats.totalProducts} />
            <StatCard title="Total Reviews" value={stats.totalReviews} />
            <StatCard title="Total Reviewers" value={stats.totalReviewers} />
            <StatCard
              title="Average Rating"
              value={`${stats.averageRating} / 5`}
            />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <StatCard
              title="Positive Sentiment"
              value={stats.sentimentBreakdown.positive}
              color="bg-green-50"
            />
            <StatCard
              title="Neutral Sentiment"
              value={stats.sentimentBreakdown.neutral}
              color="bg-yellow-50"
            />
            <StatCard
              title="Negative Sentiment"
              value={stats.sentimentBreakdown.negative}
              color="bg-red-50"
            />
          </div>
        </>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 font-medium">Dataset not loaded yet</p>
          <p className="mt-1 text-sm text-gray-300">
            Drop the dataset files into <code>/data/</code> and update{" "}
            <code>lib/data.ts</code>
          </p>
        </div>
      )}
    </div>
  );
}
