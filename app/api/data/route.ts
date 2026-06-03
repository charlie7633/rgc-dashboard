import { NextResponse } from "next/server";
import { loadProducts, loadReviews, loadReviewers, computeStats } from "@/lib/data";

export async function GET() {
  try {
    const [products, reviews, reviewers] = await Promise.all([
      loadProducts(),
      loadReviews(),
      loadReviewers(),
    ]);

    const stats = computeStats(products, reviews, reviewers);

    return NextResponse.json({ products, reviews, reviewers, stats });
  } catch (error) {
    console.error("Data load error:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
