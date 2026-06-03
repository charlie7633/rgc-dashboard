"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { resolveCol, PRODUCT_KEYS, RATING_KEYS, NUMERIC_KEYS, CATEGORY_KEYS } from "@/lib/col-resolver";

interface Props { rows: Record<string, string>[]; }

export function RatingBarChart({ rows }: Props) {
  if (!rows.length) return null;

  // Find best grouping column (product → category fallback)
  const groupKey = PRODUCT_KEYS.find((k) => rows.some((r) => r[k])) ?? CATEGORY_KEYS.find((k) => rows.some((r) => r[k]));

  // Find best metric column
  const metricKey = NUMERIC_KEYS.find((k) => rows.some((r) => !isNaN(parseFloat(r[k])) && parseFloat(r[k]) > 0));

  const isRating = metricKey ? RATING_KEYS.includes(metricKey) : false;

  const productMap: Record<string, { total: number; count: number }> = {};

  rows.forEach((r) => {
    const group = (groupKey ? r[groupKey] : null) || "Unknown";
    if (group === "Unknown" && !groupKey) return;

    const metricVal = metricKey ? parseFloat(r[metricKey] ?? "") : NaN;
    const value = !isNaN(metricVal) && metricVal > 0 ? metricVal : 1; // count rows if no metric

    if (!productMap[group]) productMap[group] = { total: 0, count: 0 };
    productMap[group].total += value;
    productMap[group].count += 1;
  });

  const useAvg = isRating; // for ratings: average. For sales/price: total.
  const data = Object.entries(productMap)
    .map(([name, { total, count }]) => ({
      name,
      value: useAvg ? Math.round((total / count) * 10) / 10 : Math.round(total),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  if (!data.length) {
    return <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>Not enough data to render this chart.</p>;
  }

  const label = metricKey
    ? isRating ? "Avg rating" : `Total ${metricKey}`
    : "Row count";

  const yDomain = isRating ? [0, 5] : undefined;

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        Grouped by <strong>{groupKey ?? "row"}</strong> · metric: <strong>{label}</strong>
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <YAxis domain={yDomain} tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(v: number) => [v, label]} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="url(#barGrad)" />
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5A67D8" /><stop offset="100%" stopColor="#1D1B84" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
