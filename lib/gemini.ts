import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function analyzeReviews(reviews: string[]): Promise<{
  sentiment: string;
  themes: string[];
  summary: string;
  score: number;
}> {
  const prompt = `You are a product analyst. Analyse the following customer reviews and return a JSON object with:
- sentiment: "positive" | "neutral" | "negative"
- themes: array of up to 5 key themes mentioned
- summary: 2-sentence summary of the reviews
- score: sentiment score from 0 (very negative) to 10 (very positive)

Reviews:
${reviews.join("\n---\n")}

Respond with ONLY valid JSON, no markdown.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text().trim();
  return JSON.parse(text);
}

export async function extractInsights(transcript: string): Promise<{
  keyPoints: string[];
  sentiment: string;
  actionItems: string[];
}> {
  const prompt = `Analyse this reviewer transcript and return a JSON object with:
- keyPoints: array of up to 5 key points from the transcript
- sentiment: "positive" | "neutral" | "negative"
- actionItems: array of up to 3 suggested product improvements

Transcript:
${transcript}

Respond with ONLY valid JSON, no markdown.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text().trim();
  return JSON.parse(text);
}
