"use client";

import { useState } from "react";

export default function InsightsPage() {
  const [reviews, setReviews] = useState("");
  const [result, setResult] = useState<null | {
    sentiment: string;
    themes: string[];
    summary: string;
    score: number;
  }>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyse() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "reviews",
          reviews: reviews.split("\n").filter(Boolean),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert("Analysis failed — check console");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Insights</h1>
      <p className="text-sm text-gray-500 mb-6">
        Paste reviews (one per line) to run Gemini analysis
      </p>

      <textarea
        className="w-full h-48 rounded-lg border border-gray-200 p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Paste review text here, one per line..."
        value={reviews}
        onChange={(e) => setReviews(e.target.value)}
      />

      <button
        onClick={handleAnalyse}
        disabled={loading || !reviews.trim()}
        className="mt-3 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors"
      >
        {loading ? "Analysing…" : "Analyse with Gemini"}
      </button>

      {result && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Sentiment</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                result.sentiment === "positive"
                  ? "bg-green-100 text-green-700"
                  : result.sentiment === "negative"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {result.sentiment}
            </span>
            <span className="ml-auto text-sm text-gray-500">
              Score: <strong>{result.score}/10</strong>
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Summary</p>
            <p className="text-sm text-gray-700">{result.summary}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Themes</p>
            <div className="flex flex-wrap gap-2">
              {result.themes.map((t) => (
                <span
                  key={t}
                  className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
