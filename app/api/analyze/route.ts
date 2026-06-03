import { NextRequest, NextResponse } from "next/server";
import { analyzeReviews, extractInsights } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, reviews, transcript } = body;

    if (type === "reviews" && reviews) {
      const result = await analyzeReviews(reviews);
      return NextResponse.json(result);
    }

    if (type === "transcript" && transcript) {
      const result = await extractInsights(transcript);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
