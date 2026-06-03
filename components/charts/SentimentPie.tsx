"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#5A67D8", "#fbbf24", "#f87171"];

interface Props {
  rows: Record<string, string>[];
}

function getSentiment(rating: number): "Positive" | "Neutral" | "Negative" {
  if (rating >= 4) return "Positive";
  if (rating >= 3) return "Neutral";
  return "Negative";
}

export function SentimentPie({ rows }: Props) {
  const counts = { Positive: 0, Neutral: 0, Negative: 0 };
  rows.forEach((r) => {
    const v = parseFloat(r.rating ?? "0");
    if (!isNaN(v)) counts[getSentiment(v)]++;
  });

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(v: number, name: string) => [v, name]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
