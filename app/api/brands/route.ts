import { NextResponse } from "next/server";
import { loadAll } from "@/lib/rgc-data";

export async function GET() {
  try {
    const { brandSummaries } = loadAll();
    return NextResponse.json(brandSummaries.map((b) => ({
      name: b.brand.brand_name,
      founded: b.brand.founded_year,
      city: b.brand.hq_city,
      website: b.brand.website,
      description: b.brand.description,
      industry: b.brand.industry,
      breakthroughScore: parseFloat(b.brand.breakthrough_score) || 0,
      momentumScore: parseFloat(b.brand.momentum_score) || 0,
      popularityScore: parseFloat(b.brand.popularity_score) || 0,
      archetypeAffinity: b.brand.archetype_affinity,
      instagram: b.brand.instagram_handle,
      tiktok: b.brand.tiktok_handle,
      productCount: b.products.length,
      transcriptCount: b.transcriptCount,
      hasTranscripts: b.hasTranscripts,
      avgRating: b.avgRating,
      sentimentBreakdown: b.sentimentBreakdown,
      wouldBuyAfterRate: b.wouldBuyAfterRate,
      wouldBuyFirstRate: b.wouldBuyFirstRate,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
