import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CANONICAL_FIELDS = [
  "product_name   — name of a product, item, or SKU",
  "rating         — numeric score or rating (any scale)",
  "reviewer_id    — unique ID or name of a customer / reviewer",
  "review_date    — date of the review, transaction, or order",
  "transcript_text— free-text review, feedback, comment, or description",
  "category       — product category, subcategory, or department",
  "price          — unit price or cost",
  "quantity       — quantity ordered or sold",
  "sentiment      — sentiment label (positive/negative/neutral)",
  "brand          — brand or company name",
  "other          — doesn't fit any of the above",
];

export async function POST(req: NextRequest) {
  try {
    const { columns } = await req.json() as {
      columns: { key: string; sample: string[] }[];
    };

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const columnList = columns
      .map((c) => `"${c.key}": samples = [${c.sample.slice(0, 3).map((s) => `"${s}"`).join(", ")}]`)
      .join("\n");

    const prompt = `You are a data analyst. Map each CSV column to the best-matching standard field from the list below.

Standard fields:
${CANONICAL_FIELDS.map((f) => `  - ${f}`).join("\n")}

CSV columns and sample values:
${columnList}

Rules:
- Each column maps to exactly one field.
- Use "other" only when nothing fits.
- If multiple columns could be "rating", pick the most likely numeric score column.
- Return ONLY a valid JSON object mapping column name → field name. No markdown, no explanation.

Example: {"Product Name": "product_name", "Stars": "rating", "Order Date": "review_date"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json|```$/g, "").trim();
    const mapping: Record<string, string> = JSON.parse(text);

    return NextResponse.json({ mapping });
  } catch (e) {
    console.error("Column mapping error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
