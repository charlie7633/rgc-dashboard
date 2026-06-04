import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadAll } from "@/lib/rgc-data";

if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { brand } = await req.json() as { brand: string };
    const { transcripts } = loadAll();

    const brandTranscripts = transcripts.filter((t) => t.brand === brand && t.transcription);
    if (!brandTranscripts.length) {
      return NextResponse.json({ error: "No transcripts for this brand" }, { status: 404 });
    }

    // Build a compact corpus — summaries + ratings + purchase intent
    const corpus = brandTranscripts.map((t, i) => {
      const wb = t.wouldBuy?.[0] ?? {};
      return `[Review ${i + 1}] Rating: ${t.rating}/5 | Buy after trying: ${wb.wouldBuyAfterTrying ?? "?"} | Buy in first place: ${wb.wouldBuyInTheFirstPlace ?? "?"} | Sentiment: ${t.transcription?.sentiment ?? "?"}
Summary: ${t.transcription?.summary ?? ""}`;
    }).join("\n\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

    const prompt = `You are a senior consumer insights analyst working with brand and retail data. You have been given ${brandTranscripts.length} video review transcripts for the brand "${brand}" in the functional soft drinks category.

Analyse these reviews and return a JSON object with the following fields:

{
  "topThemes": [string, string, string, string, string],        // 5 most recurring themes across all reviews (2-5 words each)
  "positiveSignals": [string, string, string],                  // 3 strongest positive signals (what reviewers love)
  "concerns": [string, string, string],                         // 3 recurring concerns or negatives (be honest, not just minor)
  "purchaseIntentInsight": string,                              // 2-sentence analysis of buy-after-trying vs buy-in-first-place gap
  "audienceProfile": string,                                    // 2-sentence description of who is actually reviewing this brand
  "standoutQuote": string,                                      // single most insightful or representative quote fragment from any summary
  "commercialOpportunity": string,                              // 2-sentence commercial opportunity or recommendation for the brand
  "overallScore": number                                        // 0-10 overall sentiment score based on the reviews
}

Reviews corpus:
${corpus}

Return ONLY valid JSON. No markdown, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json|^```|```$/gm, "").trim();
    const analysis = JSON.parse(text);

    return NextResponse.json({
      brand,
      reviewCount: brandTranscripts.length,
      analysis,
    });
  } catch (e) {
    console.error("Insights error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
