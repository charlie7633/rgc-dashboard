# RGC Dashboard — Technical Assessment

A full-stack dashboard application built for the Really Good Culture technical assessment. It displays product and reviewer data, extracts signals from review transcripts using Google Gemini, and surfaces commercial insights through a clean UI.

## Live Demo

[https://rgc-dashboard.vercel.app](https://rgc-dashboard.vercel.app)

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI**: Google Gemini (gemini-2.0-flash / gemini-2.5-flash-preview) via `@google/generative-ai`
- **Hosting**: Vercel

## Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and add your Gemini API key:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx          — Overview / stats
  products/         — Product list + ratings
  reviews/          — Review table with sentiment
  reviewers/        — Reviewer profiles
  insights/         — AI-powered review analysis
  api/
    data/           — Serves parsed dataset
    analyze/        — Gemini analysis endpoint
lib/
  gemini.ts         — Gemini client + prompt helpers
  data.ts           — Dataset loading utilities
  types.ts          — Shared TypeScript types
components/         — Reusable UI components
data/               — Dataset files (gitignored)
```

## Approach

- **Next.js App Router** for full-stack simplicity — frontend and API routes in one repo, no separate server needed
- **Gemini over OpenAI** — practical cost decision (existing Pro plan); used `gemini-2.5-flash-preview` for insights, `gemini-2.0-flash` for lighter inference tasks
- **Intent gap metric** as the primary commercial signal: the pp gap between `wouldBuyAfterTrying` and `wouldBuyInTheFirstPlace` surfaces discovery/distribution problems that average rating masks entirely
- **Static insights as the baseline layer** — pre-computed brand analysis in `lib/static-insights.ts` means the insights page always loads with real data; Gemini enhances it on demand rather than being a hard dependency
- **Scoped upload to RGC column conventions** — tested against arbitrary CSVs and found edge-case handling would consume the remaining time; a focused tool that works beats an ambitious one that doesn't

## Tradeoffs

| Decision | Alternative | Reason |
|---|---|---|
| Static insights + Gemini enhancement | Gemini-only live analysis | Resilient to API rate limits; hit usage cap mid-build |
| RGC-structured upload | Universal CSV parser | Time constraint; Gemini column mapper is a step toward flexibility |
| Session storage for state | Login / persistent saves | Right scope for a single-session assessment tool |
| Summaries sent to Gemini | Raw transcript text | Token efficiency; summaries already AI-generated from the source video |

## What I'd Improve With More Time

1. **Competitive set comparison chart** — the 5 non-reviewed brands have breakthrough/momentum scores unused in any visualisation
2. **Raw transcript mining** — send full `transcription.text` to Gemini for theme extraction rather than pre-computed summaries
3. **Persistent named sessions** — so teams can share and revisit a dataset view without re-uploading
4. **Universal column handling** — a more robust mapping layer beyond the current Gemini-assisted approach
