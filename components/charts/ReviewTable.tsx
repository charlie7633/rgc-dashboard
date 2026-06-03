"use client";

import { useState } from "react";

interface Props {
  rows: Record<string, string>[];
}

function ratingColour(r: number) {
  if (r >= 4) return { bg: "#dcfce7", color: "#15803d" };
  if (r >= 3) return { bg: "#fef9c3", color: "#854d0e" };
  return { bg: "#fee2e2", color: "#dc2626" };
}

export function ReviewTable({ rows }: Props) {
  const [sort, setSort] = useState<"rating_asc" | "rating_desc" | "date">("rating_desc");
  const [search, setSearch] = useState("");

  const filtered = rows
    .filter((r) => {
      if (!search) return true;
      return Object.values(r).some((v) => v.toLowerCase().includes(search.toLowerCase()));
    })
    .sort((a, b) => {
      if (sort === "rating_asc") return parseFloat(a.rating ?? "0") - parseFloat(b.rating ?? "0");
      if (sort === "rating_desc") return parseFloat(b.rating ?? "0") - parseFloat(a.rating ?? "0");
      return (a.review_date ?? "").localeCompare(b.review_date ?? "");
    })
    .slice(0, 50);

  return (
    <div>
      <div className="flex gap-3 mb-3">
        <input
          type="text"
          placeholder="Search reviews…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs px-3 py-2 rounded-lg border"
          style={{ borderColor: "var(--color-card-border)", color: "var(--text-secondary)" }}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="text-xs px-3 py-2 rounded-lg border"
          style={{ borderColor: "var(--color-card-border)", color: "var(--text-secondary)" }}
        >
          <option value="rating_desc">Rating ↓</option>
          <option value="rating_asc">Rating ↑</option>
          <option value="date">Date</option>
        </select>
      </div>

      <div className="overflow-auto rounded-xl border" style={{ borderColor: "var(--color-card-border)" }}>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ background: "#eef2ff" }}>
              <th className="text-left px-3 py-2 font-semibold" style={{ color: "#4338ca" }}>Product</th>
              <th className="text-left px-3 py-2 font-semibold" style={{ color: "#4338ca" }}>Rating</th>
              <th className="text-left px-3 py-2 font-semibold" style={{ color: "#4338ca" }}>Reviewer</th>
              <th className="text-left px-3 py-2 font-semibold" style={{ color: "#4338ca" }}>Date</th>
              <th className="text-left px-3 py-2 font-semibold" style={{ color: "#4338ca" }}>Review</th>
              <th className="text-left px-3 py-2 font-semibold" style={{ color: "#4338ca" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const rating = parseFloat(r.rating ?? "0");
              const { bg, color } = ratingColour(rating);
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 ? "#fafafa" : "white" }}>
                  <td className="px-3 py-2 font-medium" style={{ color: "var(--text-secondary)" }}>{r.product_name ?? r.product ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: bg, color }}>
                      {isNaN(rating) ? "—" : rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2" style={{ color: "var(--text-muted)" }}>{r.reviewer_id ?? r.reviewer ?? "—"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--text-muted)" }}>{r.review_date ?? r.date ?? "—"}</td>
                  <td className="px-3 py-2 max-w-xs truncate" style={{ color: "var(--text-secondary)" }}>{r.transcript_text ?? r.review ?? r.text ?? "—"}</td>
                  <td className="px-3 py-2">
                    {r._status && r._status !== "clean" && (
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: r._status === "filled" ? "#fef9c3" : "#fee2e2",
                          color: r._status === "filled" ? "#854d0e" : "#dc2626",
                        }}
                      >
                        {r._status}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
        Showing {filtered.length} of {rows.length} rows
      </p>
    </div>
  );
}
