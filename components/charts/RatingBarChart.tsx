"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  rows: Record<string, string>[];
}

export function RatingBarChart({ rows }: Props) {
  const productMap: Record<string, { total: number; count: number }> = {};
  rows.forEach((r) => {
    const p = r.product_name ?? r.product ?? "Unknown";
    const v = parseFloat(r.rating ?? "0");
    if (!isNaN(v)) {
      if (!productMap[p]) productMap[p] = { total: 0, count: 0 };
      productMap[p].total += v;
      productMap[p].count += 1;
    }
  });

  const data = Object.entries(productMap)
    .map(([name, { total, count }]) => ({ name, avg: Math.round((total / count) * 10) / 10 }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
        <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(v: number) => [`${v} / 5`, "Avg rating"]}
        />
        <Bar dataKey="avg" radius={[4, 4, 0, 0]}
          fill="url(#barGrad)" />
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A67D8" />
            <stop offset="100%" stopColor="#1D1B84" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
