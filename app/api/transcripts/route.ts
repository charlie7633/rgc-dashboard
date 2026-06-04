import { NextResponse } from "next/server";
import { loadAll, EnrichedTranscript } from "@/lib/rgc-data";

export async function GET() {
  try {
    const { transcripts } = loadAll();
    return NextResponse.json(transcripts.map((t: EnrichedTranscript) => ({
      reviewId: t.reviewId,
      brand: t.brand,
      productId: t.productId,
      productName: t.product?.productName ?? t.votes?.[0]?.product?.name ?? "",
      createdAt: t.createdAt,
      rating: t.rating,
      sentiment: t.sentiment,
      summary: t.summary,
      wordCount: t.wordCount,
      wouldBuyAfter: t.wouldBuyAfter,
      wouldBuyFirst: t.wouldBuyFirst,
      isFeatured: t.isFeatured,
      challengeTitle: t.challenge?.title ?? null,
      text: t.text,
      user: t.user ? {
        firstName: t.user.firstName,
        lastName: t.user.lastName,
        age: t.user.age,
        gender: t.user.gender,
        region: t.user.region,
        tier: t.user.videoReviewerTier,
        primaryArchetype: t.user.archetypes?.[0]?.name ?? "",
        archetypes: t.user.archetypes?.map((a) => a.name) ?? [],
        tags: t.user.tags ?? [],
      } : null,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
