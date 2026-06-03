/**
 * lib/rgc-data.ts
 * Loads and joins all four RGC dataset files server-side.
 * Join chain: users ↔ transcripts ↔ products ↔ brands
 */

import fs from "fs";
import path from "path";

// ── Raw types ──────────────────────────────────────────────────────────────

export interface RawTranscript {
  reviewId: string;
  brand: string;
  personId: string;
  productId: string;
  createdAt: string;
  isFeatured: boolean;
  isPublished: boolean;
  challenge: { id: string; title: string; slug: string } | null;
  votes: { product: { id: string; name: string }; rating: number }[];
  wouldBuy: { wouldBuyAfterTrying: string; wouldBuyInTheFirstPlace: string }[];
  transcription: {
    text: string;
    summary: string;
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    wordCount: number;
  } | null;
}

export interface RawUser {
  reviewId: string;
  personId: string;
  brand: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  region: string;
  videoReviewerTier: "TIER_1" | "TIER_2" | "TIER_3";
  archetypes: { name: string; order: number }[];
  tags: string[];
  questions: { id: string; title: string; answers: { id: string; text: string }[] }[];
}

export interface RawBrand {
  brand_name: string;
  founded_year: string;
  hq_city: string;
  hq_country: string;
  description: string;
  industry: string;
  website: string;
  breakthrough_score: string;
  momentum_score: string;
  popularity_score: string;
  archetype_affinity: string;
  research_overall_assessment: string;
  instagram_handle: string;
  tiktok_handle: string;
}

export interface RawProduct {
  productId: string;
  brand: string;
  productName: string;
  subcategory: string;
  price: string;
  price_multipack: string;
  multipack_quantity: string;
  pack_size: string;
  description: string;
  retailers_available: string;
  "packaging_attributes.packaging_type": string;
  "market_position.market_maturity": string;
  "market_position.price_tier": string;
  "market_position.seasonality": string;
  target_user_1_segment: string;
  target_user_2_segment: string;
  target_user_3_segment: string;
  labels: string;
}

// ── Enriched types ─────────────────────────────────────────────────────────

export interface EnrichedTranscript extends RawTranscript {
  rating: number;
  wouldBuyAfter: boolean;
  wouldBuyFirst: boolean;
  sentiment: string;
  summary: string;
  text: string;
  wordCount: number;
  user: RawUser | null;
  product: RawProduct | null;
}

export interface BrandSummary {
  brand: RawBrand;
  products: RawProduct[];
  transcripts: EnrichedTranscript[];
  transcriptCount: number;
  avgRating: number;
  sentimentBreakdown: Record<string, number>;
  wouldBuyAfterRate: number;
  wouldBuyFirstRate: number;
  hasTranscripts: boolean;
}

// ── CSV parser ─────────────────────────────────────────────────────────────

function parseCSV<T>(text: string): T[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""])) as T;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

// ── Loaders ────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");

let _cache: ReturnType<typeof loadAll> | null = null;

export function loadAll() {
  if (_cache) return _cache;

  const transcripts: RawTranscript[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "transcripts.json"), "utf-8")
  );
  const users: RawUser[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "users.json"), "utf-8")
  );
  const products: RawProduct[] = parseCSV<RawProduct>(
    fs.readFileSync(path.join(DATA_DIR, "products.csv"), "utf-8")
  );
  const brands: RawBrand[] = parseCSV<RawBrand>(
    fs.readFileSync(path.join(DATA_DIR, "brands.csv"), "utf-8")
  );

  // User lookup: key = reviewId + personId
  const userMap = new Map<string, RawUser>();
  users.forEach((u) => userMap.set(`${u.reviewId}__${u.personId}`, u));

  // Product lookup
  const productMap = new Map<string, RawProduct>();
  products.forEach((p) => productMap.set(p.productId, p));

  // Enrich transcripts
  const enriched: EnrichedTranscript[] = transcripts.map((t) => {
    const rating = t.votes?.[0]?.rating ?? 0;
    const wb = t.wouldBuy?.[0] ?? {};
    return {
      ...t,
      rating,
      wouldBuyAfter: wb.wouldBuyAfterTrying === "Yes",
      wouldBuyFirst: wb.wouldBuyInTheFirstPlace === "Yes",
      sentiment: t.transcription?.sentiment ?? "UNKNOWN",
      summary: t.transcription?.summary ?? "",
      text: t.transcription?.text ?? "",
      wordCount: t.transcription?.wordCount ?? 0,
      user: userMap.get(`${t.reviewId}__${t.personId}`) ?? null,
      product: productMap.get(t.productId) ?? null,
    };
  });

  // Brand lookup
  const brandMap = new Map<string, RawBrand>();
  brands.forEach((b) => brandMap.set(b.brand_name, b));

  // Brand summaries
  const brandSummaries: BrandSummary[] = brands.map((brand) => {
    const brandProducts = products.filter((p) => p.brand === brand.brand_name);
    const brandTranscripts = enriched.filter((t) => t.brand === brand.brand_name);

    const ratings = brandTranscripts.map((t) => t.rating).filter(Boolean);
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
      : 0;

    const sentimentBreakdown: Record<string, number> = {};
    brandTranscripts.forEach((t) => {
      sentimentBreakdown[t.sentiment] = (sentimentBreakdown[t.sentiment] ?? 0) + 1;
    });

    const withBuyAfter = brandTranscripts.filter((t) => t.wouldBuy?.[0]);
    const wouldBuyAfterRate = withBuyAfter.length
      ? Math.round((withBuyAfter.filter((t) => t.wouldBuyAfter).length / withBuyAfter.length) * 100)
      : 0;
    const wouldBuyFirstRate = withBuyAfter.length
      ? Math.round((withBuyAfter.filter((t) => t.wouldBuyFirst).length / withBuyAfter.length) * 100)
      : 0;

    return {
      brand,
      products: brandProducts,
      transcripts: brandTranscripts,
      transcriptCount: brandTranscripts.length,
      avgRating,
      sentimentBreakdown,
      wouldBuyAfterRate,
      wouldBuyFirstRate,
      hasTranscripts: brandTranscripts.length > 0,
    };
  });

  _cache = { transcripts: enriched, users, products, brands, brandSummaries, productMap, userMap };
  return _cache;
}
