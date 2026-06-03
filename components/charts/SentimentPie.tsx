"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { resolveCol, RATING_KEYS, SENTIMENT_KEYS } from "@/lib/col-resolver";

const COLOURS = ["#5A67D8", "#fbbf24", "#f87171"];

interface Props { rows: Record<string, string>[]; }

function getSentiment(rating: number) {
  if (rating >= 4) return "Positive";
  if (rating >= 3) return "Neutral";
  return "Negative";
}

export function SentimentPie({ rows }: Props) {
  // Prefer an explicit sentiment column; fall back to deriving from rating
  const hasSentimentCol = rows.some((r) => resolveCol(r, ...SENTIMENT_KEYS));

  const counts: Record<string, number> = {};

  if (hasSentimentCol) {
    rows.forEach((r) => {
      const s = resolveCol(r, ...SENTIMENT_KEYS);
      if (s) {
        const key = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        counts[key] = (counts[key] ?? 0) + 1;
      }
    });
  } else {
    rows.forEach((r) => {
      const v = parseFloat(resolveCol(r, ...RATING_KEYS));
      if (!isNaN(v) && v > 0) {
        const key = getSentiment(v);
        counts[key] = (counts[key] ?? 0) + 1;
      }
    });
  }

  const data = Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  if (!data.length) {
    return <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>No rating or sentiment column detected.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} cx="50%" cy="45%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
          {data.map((entry, i) => <Cell key={`pie-${entry.name}`} fill={COLOURS[i % COLOURS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
