# Thinking Log — RGC Technical Assessment

> Narrated live using Wispr Flow (voice-to-text) as I worked.
> Raw, honest notes — dead ends included.

---

## Pre-work (Monday 1st – Tuesday 2nd June)

Once I got the expectations and outline for the take-home, I used Monday to Tuesday to get the foundations in place so that when the actual 24-hour window opened I'd have a head start.

**Stack decisions made upfront:**

- **Next.js App Router** — one repo handles both the frontend and API routes. No need for a separate Express server, which keeps the codebase lean and the deployment simple.
- **Gemini over OpenAI** — I have a Gemini Pro plan from a student subscription, so no point burning credits on OpenAI for a time-boxed task. I treated this as a practical cost decision: use what you have access to, not what sounds impressive.
- **Claude for heavy lifting, Gemini for in-app calls** — my workflow was to use Claude as the senior reviewer for architecture decisions and larger code changes, and Gemini for the lighter in-app inference (column mapping, live insights). I treat AI like junior programmers: I feed them tasks with full context, review what they suggest, and make the final call myself. I don't just accept output blindly — any suggestion gets checked before it goes in, especially around things like API key handling.
- **Abstracted data loading early** — I built `lib/data.ts` as a placeholder before the dataset arrived so I could swap in the real files without touching the rest of the app. This ended up being the right call.

I also used Mobbin and Refero to look at dashboard layouts before writing any UI, and analysed RGC's own brand colours using Gemini so the dashboard felt on-brand rather than generic.

---

## Wednesday 3rd June — Take-home opens (4:30pm)

Read the brief fully before touching any code. Then opened the dataset in a spreadsheet to understand the shape before writing a single line of data logic.

First impressions on the data:
- Four files: two JSON (transcripts, users), two CSV (products, brands)
- The join chain is non-trivial: users ↔ transcripts ↔ products ↔ brands, with a composite key (`reviewId` + `personId`) needed to link users to transcripts correctly
- Only 4 of 9 brands have transcript data — the other 5 are competitive context. This is intentional and important: a naive "loop all brands" approach would silently produce empty insights for half the dataset
- Sentiment skews heavily positive (109/130 POSITIVE) — typical of solicited video reviews. Average rating alone would be a misleading signal

---

## First issue — upload flow

Claude initially auto-populated the dataset directly into the site rather than building an upload flow. I flagged this immediately: the whole point is that Sophie, Sahil, Mateo, or whoever should be able to drop in their own dataset on a fresh slate — not see a pre-loaded version.

I pushed back and had it rethink the architecture so the upload page is the actual entry point, with the RGC dataset available as a demo mode rather than the default.

---

## Second issue — stale session state

After fixing the upload flow, I tested with a completely different dataset I found online (one Claude had no knowledge of). The data loaded fine at first, but when I uploaded a second dataset, residual data from the first one was bleeding through.

The fix was to clear sessionStorage on every new upload. I considered adding persistent saves (like named sessions or a login system) but scoped it out — for a take-home task, stateless-per-session is the right tradeoff. A login/persistence layer would add meaningful complexity for something assessors will test in a single session anyway.

---

## The scope decision — RGC column structure vs. universal CSV

Around 2:30am I made a deliberate call to stop trying to support arbitrary CSV schemas and instead build around the RGC column structure.

**The tradeoff:** A truly universal upload tool would need to handle wildly different column names, data shapes, and missing fields gracefully — and it kept breaking on real-world datasets I was testing with. I could have spent the remaining hours on edge-case handling, but that would have left the core dashboard half-finished.

**The decision:** Scope the upload to datasets that follow RGC's column conventions (or close to them), document this clearly, and ship a dashboard that actually works well for the intended use case. If this were a real product, the right next step would be a proper column-mapping UI — but for the assessment, a focused tool that works is better than an ambitious one that doesn't.

The Gemini-powered column mapper (`/api/map-columns`) is a step toward that flexibility — it maps column names intelligently before visualisation — but it's not a full solution for arbitrary data.

---

## The intent gap metric

The most commercially interesting signal in this dataset isn't average rating — it's the gap between **would-buy-after-trying** and **would-buy-in-first-place**.

A high buy-after rate with a low buy-first rate means: people who encounter the product love it, but they weren't going to seek it out unprompted. That's not a product quality problem — it's a discovery and distribution problem. The two require completely different commercial responses.

Computing this gap per brand (UNAI: 48pp, Double Dutch: 46pp, Fix8: 38pp, SKIP: 28pp) gives a much more actionable read of each brand's commercial situation than a simple NPS-style score. That's what I built the insights layer around.

---

## Gemini usage limits and the fallback architecture

Midway through I hit Gemini usage limits on the live insights endpoint.

**The tradeoff decision:** Rather than blocking the entire insights page on a live API call, I pre-computed a full set of brand insights (`lib/static-insights.ts`) from the dataset myself — reading the transcripts, computing the metrics, and writing the analysis with full dataset context. This means the insights page always loads with real, accurate data. Gemini enhances it when available (the "Enhance with Gemini" button triggers a live call), but it's never a hard dependency.

This is also honest: the static insights are arguably better than what a single rushed API call produces, because they were written with full context of the dataset rather than a summarised corpus. The Gemini layer adds a cross-check and a catch-all, not a replacement.

---

## AI workflow — how I used it throughout

My general approach was to use Claude and Gemini as junior programmers: give them full context and a specific task, review what they produce, and make the final call on what goes in. A few principles I followed:

- **Cross-check suggestions** — when one model gave a suggestion I wasn't sure about, I'd bring it to the other with just the base-level context and see if it reached the same conclusion independently. Basically a consultant review.
- **Never accept output blindly** — especially anything touching environment variables, API keys, or data handling. Copilot's GitHub secret scanning was running throughout as a safety net.
- **AI for speed, human for judgement** — AI got me to a working scaffold faster, but decisions like the scope call, the fallback architecture, and the intent gap metric came from reading the brief and the data myself.

---

## After external review — 4th June

Before submitting I asked two people outside of tech/data to test the site. Neither had any context on the brief.

**Friend 1 (non-technical, general user):**
Main feedback was around colour coding — she didn't know what the colours on the charts meant and expected a legend to be immediately visible, not something you discover by hovering. She also said the site felt like it was built for someone who already understood what they were looking at.

Changes made:
- Added colour legends to all charts upfront (brand colour key on BTS chart, sentiment legend on brand cards)
- Added descriptive subtitles to every chart explaining what the metric means in plain English
- Renamed stat card labels to plain language ("Would Buy Again" instead of "purchase intent signal")
- Rewrote the page subtitle to explain the 4-vs-9 brand split clearly upfront

**Friend 2 (software tester):**
More specific feedback — text contrast too low, key insight callout too small, two percentage values side by side with no labels, Y-axis scale inconsistent between charts.

Changes made:
- Darkened `--text-muted` globally from `#94a3b8` to `#64748b`
- Bumped key insight text from `text-xs` to `text-sm`
- Added column headers (pos. / rating / buy again) above the brand rows
- Standardised Y-axis to 0 / 20 / 40 / 60 across all BTS charts

Second round fixes after they saw the updated build:
- Agua de Madre bar label cut off — fixed by angling X-axis labels at -35°
- Reviewer tier cards didn't explain what Tier 1/2/3 meant — added a plain English explainer banner
- AI Insights layout restructured — Positive Signals (light green) and Concerns (light red) moved to the bottom row so the signal is immediately readable
- Brands page had no affordance that cards were clickable — added `›` chevrons, "Click to view details →" hints, and a visual divider between the list and detail panel

**Broader takeaway:** Both reviews pointed to the same underlying issue — the dashboard was built by someone who already understood the data, and it showed. Small things like unlabelled colour bars and jargon subtitles are invisible when you're close to the work. Getting external eyes on it in the final hours was worth it.

---

## What I'd do with more time

1. **Competitive context comparison** — the 5 non-reviewed brands have breakthrough and momentum scores that aren't currently used in any chart. A cross-brand comparison chart using the full 9-brand set would add real commercial value.
2. **Deeper transcript mining** — currently Gemini receives pre-computed summaries. Sending raw transcript text for theme extraction would surface signals the summaries might have smoothed over.
3. **Persistent sessions** — named saves so teams can share and revisit a specific dataset view without re-uploading.
4. **Universal column handling** — the current upload works best with RGC-structured data. A more robust column-mapping layer would make it genuinely useful for any dataset.
