import { NextResponse } from "next/server";
import { loadAll, EnrichedTranscript, RawProduct } from "@/lib/rgc-data";

export async function GET() {
  try {
    const { products, transcripts } = loadAll();

    // Count reviews per product
    const reviewCounts: Record<string, { count: number; avgRating: number; ratings: number[] }> = {};
    transcripts.forEach((t: EnrichedTranscript) => {
      if (!reviewCounts[t.productId]) reviewCounts[t.productId] = { count: 0, avgRating: 0, ratings: [] };
      reviewCounts[t.productId].count++;
      if (t.rating) reviewCounts[t.productId].ratings.push(t.rating);
    });
    Object.entries(reviewCounts).forEach(([, v]) => {
      v.avgRating = v.ratings.length
        ? Math.round((v.ratings.reduce((s, r) => s + r, 0) / v.ratings.length) * 10) / 10
        : 0;
    });

    return NextResponse.json((products as RawProduct[]).map((p) => ({
      productId: p.productId,
      brand: p.brand,
      productName: p.productName,
      subcategory: p.subcategory,
      price: parseFloat(p.price) || 0,
      priceMultipack: parseFloat(p.price_multipack) || null,
      packSize: p.pack_size,
      retailers: p.retailers_available,
      packagingType: p["packaging_attributes.packaging_type"],
      maturity: p["market_position.market_maturity"],
      priceTier: p["market_position.price_tier"],
      seasonality: p["market_position.seasonality"],
      targetUser1: p.target_user_1_segment,
      targetUser2: p.target_user_2_segment,
      targetUser3: p.target_user_3_segment,
      labels: p.labels,
      reviewCount: reviewCounts[p.productId]?.count ?? 0,
      avgRating: reviewCounts[p.productId]?.avgRating ?? 0,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
