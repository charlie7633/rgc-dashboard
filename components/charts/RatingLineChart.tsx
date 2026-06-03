"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  rows: Record<string, string>[];
}

export function RatingLineChart({ rows }: Props) {
  const byDate: Record<string, { total: number; count: number }> = {};

  rows.forEach((r) => {
    const date = (r.review_date ?? r.date ?? "").slice(0, 7); // YYYY-MM
    const v = parseFloat(r.rating ?? "0");
    if (!date || isNaN(v)) return;
    if (!byDate[date]) byDate[date] = { total: 0, count: 0 };
    byDate[date].total += v;
    byDate[date].count += 1;
  });

  const data = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { total, count }]) => ({
      date,
      avg: Math.round((total / count) * 10) / 10,
    }));

  if (!data.length) {
    return (
      <div className="h-60 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
        No date column detected
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
        <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(v: number) => [`${v} / 5`, "Avg rating"]}
        />
        <Line type="monotone" dataKey="avg" stroke="#5A67D8" strokeWidth={2} dot={{ r: 3, fill: "#5A67D8" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
