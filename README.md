# RGC Dashboard — Technical Assessment

A full-stack dashboard application built for the Really Good Culture technical assessment. It displays product and reviewer data, extracts signals from review transcripts using Google Gemini, and surfaces commercial insights through a clean UI.

## Live Demo

_Link to be added after deployment_

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI**: Google Gemini (gemini-1.5-pro) via `@google/generative-ai`
- **Hosting**: _TBD_

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

## Approach & Assumptions

_To be completed during the assessment once the dataset arrives._

Key decisions:
- Chose Next.js for full-stack simplicity (frontend + API routes in one repo)
- Used Gemini for text analysis to avoid OpenAI costs — fits the brief's emphasis on practical AI use
- Data loading abstracted in `lib/data.ts` so it's easy to swap formats (JSON, CSV, etc.) once the dataset lands
- Sentiment analysis runs server-side to keep the API key off the client

## Tradeoffs

_To be completed during the assessment._

## What I'd Improve With More Time

_To be completed during the assessment._
