"use client";

import { useEffect, useState } from "react";
import { resolveCol, PRODUCT_KEYS, RATING_KEYS, REVIEWER_KEYS } from "@/lib/col-resolver";

interface Product {
  productId: string; brand: string; productName: string; subcategory: string;
  price: number; packSize: string; retailers: string; priceTier: string;
  maturity: string; seasonality: string; targetUser1: string; targetUser2: string;
  reviewCount: number; avgRating: number; labels: string;
}

const TIER_COLOURS: Record<string, { bg: string; color: string }> = {
  premium:    { bg: "#eef2ff", color: "#4338ca" },
  "mid-range":{ bg: "#f0fdf4", color: "#166534" },
  budget:     { bg: "#fefce8", color: "#854d0e" },
};

const BRAND_COLOURS: Record<string, string> = {
  "Double Dutch": "#5A67D8", "Fix8": "#C061B9", "SKIP": "#4EA4B5",
  "UNAI": "#E289C1", "Trip": "#94a3b8", "DASH": "#94a3b8",
  "Hip Pop": "#94a3b8", "Agua de Madre": "#94a3b8", "Dalston's": "#94a3b8",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mode, setMode] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "reviews">("reviews");

  useEffect(() => {
    const m = sessionStorage.getItem("rgc_mode") ?? "demo";
    setMode(m);

    if (m === "demo") {
      // Deduplicate by productId
      fetch("/api/products").then((r) => r.json()).then((data: Product[]) => {
        const seen = new Set<string>();
        setProducts(data.filter((p) => {
          if (seen.has(p.productId)) return false;
          seen.add(p.productId);
          return true;
        }));
      });
    } else {
      // Build a product summary from uploaded rows
      const raw = sessionStorage.getItem("rgc_dataset");
      if (!raw) return;
      const rows: Record<string, string>[] = JSON.parse(raw);
      const map: Record<string, { count: number; ratings: number[] }> = {};
      rows.forEach((r) => {
        const name = resolveCol(r, ...PRODUCT_KEYS) || "Unknown";
        if (!map[name]) map[name] = { count: 0, ratings: [] };
        map[name].count++;
        const rating = parseFloat(resolveCol(r, ...RATING_KEYS));
        if (!isNaN(rating) && rating > 0) map[name].ratings.push(rating);
      });
      const derived: Product[] = Object.entries(map).map(([name, v]) => ({
        productId: name, brand: resolveCol(rows[0] ?? {}, "brand", "Brand") || "—",
        productName: name, subcategory: "—", price: 0, packSize: "—", retailers: "—",
        priceTier: "—", maturity: "—", seasonality: "—", targetUser1: "—", targetUser2: "—",
        labels: "—",
        reviewCount: v.count,
        avgRating: v.ratings.length ? Math.round((v.ratings.reduce((s, n) => s + n, 0) / v.ratings.length) * 10) / 10 : 0,
      }));
      setProducts(derived.sort((a, b) => b.reviewCount - a.reviewCount));
    }
  }, []);

  const brands = ["All", ...Array.from(new Set(products.map((p) => p.brand))).sort()];
  const tiers = ["All", "premium", "mid-range", "budget"];

  const filtered = products
    .filter((p) => brandFilter === "All" || p.brand === brandFilter)
    .filter((p) => tierFilter === "All" || p.priceTier === tierFilter)
    .filter((p) => !search || p.productName.toLowerCase().includes(search.toLowerCase()) || p.subcategory.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "rating") return b.avgRating - a.avgRating;
      return b.reviewCount - a.reviewCount;
    });

  const avgPrice = products.filter(p => p.price > 0).length
    ? (products.filter(p => p.price > 0).reduce((s, p) => s + p.price, 0) / products.filter(p => p.price > 0).length).toFixed(2) : "—";
  const reviewed = products.filter((p) => p.reviewCount > 0).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Products</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {products.length} products{mode === "demo" ? " across 9 brands" : ""} · {reviewed} have reviews
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Products", val: products.length, accent: "var(--color-rgc-blue)" },
          { label: "Avg Unit Price", val: avgPrice === "—" ? "—" : `£${avgPrice}`, accent: "var(--color-rgc-electric)" },
          { label: "With Reviews", val: reviewed, accent: "var(--color-rgc-teal)" },
          { label: "No Reviews", val: products.length - reviewed, accent: "var(--color-rgc-orchid)" },
        ].map(({ label, val, accent }) => (
          <div key={label} className="rounded-xl p-5" style={{ background: "var(--color-card)", border: `2px solid ${accent}` }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {/* Brand pills — compact */}
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => (
            <button key={b} onClick={() => setBrandFilter(b)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: brandFilter === b ? (BRAND_COLOURS[b] ?? "var(--color-rgc-electric)") : "#f1f5f9",
                color: brandFilter === b ? "white" : "var(--text-muted)",
              }}>
              {b}
            </button>
          ))}
        </div>

        {mode === "demo" && (
          <>
            <div className="w-px h-5 bg-slate-200" />
            {tiers.map((t) => {
              const meta = TIER_COLOURS[t];
              return (
                <button key={t} onClick={() => setTierFilter(t)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: tierFilter === t ? (meta?.bg ?? "#f1f5f9") : "#f1f5f9",
                    color: tierFilter === t ? (meta?.color ?? "var(--text-muted)") : "var(--text-muted)",
                    border: tierFilter === t ? `1px solid ${meta?.color ?? "#94a3b8"}` : "1px solid transparent",
                  }}>
                  {t}
                </button>
              );
            })}
          </>
        )}

        <div className="ml-auto flex gap-2 items-center">
          <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: "var(--color-card-border)", color: "var(--text-secondary)" }} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: "var(--color-card-border)", color: "var(--text-secondary)" }}>
            <option value="reviews">Sort: Reviews</option>
            <option value="rating">Sort: Rating</option>
            {mode === "demo" && <option value="price">Sort: Price</option>}
          </select>
        </div>
      </div>

      {/* Product table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-card-border)" }}>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ background: "#eef2ff" }}>
              <th className="text-left px-3 py-2.5 font-semibold" style={{ color: "#4338ca" }}>Product</th>
              <th className="text-left px-3 py-2.5 font-semibold" style={{ color: "#4338ca" }}>Brand</th>
              {mode === "demo" && <>
                <th className="text-left px-3 py-2.5 font-semibold" style={{ color: "#4338ca" }}>Subcategory</th>
                <th className="text-left px-3 py-2.5 font-semibold" style={{ color: "#4338ca" }}>Price</th>
                <th className="text-left px-3 py-2.5 font-semibold" style={{ color: "#4338ca" }}>Tier</th>
                <th className="text-left px-3 py-2.5 font-semibold" style={{ color: "#4338ca" }}>Retailers</th>
              </>}
              <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#4338ca" }}>Reviews</th>
              <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#4338ca" }}>Avg Rating</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const tier = TIER_COLOURS[p.priceTier];
              return (
                <tr key={p.productId} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 ? "#fafafa" : "white" }}>
                  <td className="px-3 py-2.5 font-medium max-w-[160px]" style={{ color: "var(--text-secondary)" }}>
                    <span className="truncate block">{p.productName}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: (BRAND_COLOURS[p.brand] ?? "#94a3b8") + "22", color: BRAND_COLOURS[p.brand] ?? "#94a3b8" }}>
                      {p.brand}
                    </span>
                  </td>
                  {mode === "demo" && <>
                    <td className="px-3 py-2.5" style={{ color: "var(--text-muted)" }}>{p.subcategory}</td>
                    <td className="px-3 py-2.5 font-semibold" style={{ color: "var(--text-primary)" }}>{p.price > 0 ? `£${p.price.toFixed(2)}` : "—"}</td>
                    <td className="px-3 py-2.5">
                      {tier ? <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: tier.bg, color: tier.color }}>{p.priceTier}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 max-w-[140px]" style={{ color: "var(--text-muted)" }}>
                      <span className="truncate block">{p.retailers}</span>
                    </td>
                  </>}
                  <td className="px-3 py-2.5 text-center">
                    {p.reviewCount > 0 ? <span className="font-semibold" style={{ color: "var(--color-rgc-electric)" }}>{p.reviewCount}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.avgRating > 0 ? (
                      <span className="font-semibold" style={{ color: p.avgRating >= 4 ? "#15803d" : p.avgRating >= 3 ? "#854d0e" : "#dc2626" }}>
                        {p.avgRating.toFixed(1)}
                      </span>
                    ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Showing {filtered.length} of {products.length} products</p>
    </div>
  );
}
