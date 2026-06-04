/**
 * Pre-computed insights derived from the RGC dataset.
 * Used as fallback when Gemini API is unavailable, and as the base layer
 * that live Gemini analysis enhances.
 */

export interface BrandInsight {
  brand: string;
  reviewCount: number;
  avgRating: number;
  sentimentBreakdown: Record<string, number>;
  wouldBuyAfterRate: number;
  wouldBuyFirstRate: number;
  intentGap: number; // pp gap between buy-after and buy-first
  topThemes: string[];
  positiveSignals: string[];
  concerns: string[];
  purchaseIntentInsight: string;
  audienceProfile: string;
  standoutQuote: string;
  commercialOpportunity: string;
  overallScore: number;
}

export const STATIC_INSIGHTS: Record<string, BrandInsight> = {
  "Double Dutch": {
    brand: "Double Dutch",
    reviewCount: 35,
    avgRating: 4.11,
    sentimentBreakdown: { POSITIVE: 30, NEUTRAL: 3, MIXED: 1, NEGATIVE: 1 },
    wouldBuyAfterRate: 80,
    wouldBuyFirstRate: 34,
    intentGap: 46,
    topThemes: ["Cocktail mixer quality", "Spirit pairings", "Premium feel", "Non-alcoholic alternative", "Flavour variety"],
    positiveSignals: [
      "Consistently praised as a premium mixer that elevates home cocktails — reviewers frequently compare favourably to Schweppes",
      "Strong crossover appeal as a standalone soft drink, particularly among health-conscious drinkers reducing alcohol",
      "Distinctive flavour profiles (pink grapefruit, cucumber watermelon) drive high recall and repeat mention"
    ],
    concerns: [
      "46-percentage-point gap between buy-after (80%) and buy-first (34%) signals a significant discovery and shelf-presence problem",
      "Price sensitivity flagged — several reviewers hesitate at unit cost vs. mainstream mixer alternatives",
      "Packaging size (200ml) noted as limiting for casual or solo consumption occasions"
    ],
    purchaseIntentInsight: "Double Dutch scores 80% on would-buy-after-trying but only 34% on would-buy-in-first-place — a 46pp gap that is the second-largest in the reviewed cohort. This strongly suggests the product over-delivers on experience but under-delivers on discovery: consumers who encounter it love it, but awareness and purchase motivation remain barriers.",
    audienceProfile: "Reviewers skew toward home entertainers and cocktail enthusiasts aged 25–40 who already buy premium spirits and want a mixer that matches. A secondary audience of sober-curious drinkers looking for flavourful non-alcoholic options is emerging strongly.",
    standoutQuote: "I'd never heard of it before but now I think it's the best mixer I've ever had — why isn't this everywhere?",
    commercialOpportunity: "The 46pp intent gap indicates that trial programmes — sampling at premium retailers, cocktail kits, or on-trade presence in premium bars — would directly convert latent satisfaction into purchase intent. Positioning Double Dutch in the same fixture as premium spirits rather than the soft drinks aisle would address both visibility and aspiration simultaneously.",
    overallScore: 8.2,
  },

  "Fix8": {
    brand: "Fix8",
    reviewCount: 45,
    avgRating: 4.40,
    sentimentBreakdown: { POSITIVE: 38, MIXED: 4, NEUTRAL: 1, NEGATIVE: 1, UNKNOWN: 1 },
    wouldBuyAfterRate: 80,
    wouldBuyFirstRate: 42,
    intentGap: 38,
    topThemes: ["Gut health benefits", "Kombucha education", "Probiotic discovery", "Taste surprise", "Wellness routine"],
    positiveSignals: [
      "Highest average rating (4.4/5) in the cohort — reviewers consistently exceed their own expectations after initial scepticism",
      "Strong functional benefit narrative: gut health and probiotic benefits are the primary purchase driver and are endorsed unprompted",
      "Best buy-in-first-place rate (42%) among reviewed brands, indicating the wellness positioning creates genuine pull demand"
    ],
    concerns: [
      "Many reviewers are first-time kombucha drinkers — category education is still a prerequisite, slowing the purchase funnel",
      "Mixed sentiment on specific flavours (particularly vinegar-forward variants), suggesting inconsistency across the range",
      "Premium price point is a recurring friction point for everyday consumption, constraining frequency"
    ],
    purchaseIntentInsight: "Fix8 has the strongest purchase intent fundamentals of all reviewed brands: 80% would buy after trying and 42% in first place — a 38pp gap that, while still significant, is the smallest in the cohort. The functional wellness narrative is creating genuine pull demand that other brands lack, suggesting the category education is beginning to pay off.",
    audienceProfile: "Reviewers are predominantly wellness-oriented women aged 25–40 who are actively managing gut health and looking for functional alternatives to alcohol or sugary drinks. Many are first-time kombucha buyers, indicating Fix8 is successfully recruiting from the mainstream rather than just converting existing kombucha drinkers.",
    standoutQuote: "I was honestly expecting it to taste horrible but it was genuinely delicious — and knowing it's good for my gut just makes it better.",
    commercialOpportunity: "Fix8 is the strongest performer in the reviewed cohort and is best positioned to capture the wellness drink category leadership. Investing in retailer education (shelf signage explaining gut health benefits) and subscription/bundle models would reduce price friction for the core audience and convert trial into habitual consumption.",
    overallScore: 9.1,
  },

  "SKIP": {
    brand: "SKIP",
    reviewCount: 25,
    avgRating: 4.21,
    sentimentBreakdown: { POSITIVE: 22, NEUTRAL: 2, NEGATIVE: 1 },
    wouldBuyAfterRate: 68,
    wouldBuyFirstRate: 40,
    intentGap: 28,
    topThemes: ["CBD stress relief", "Functional wellness", "Flavour approachability", "Work/lifestyle use", "Calming effects"],
    positiveSignals: [
      "Smallest intent gap (28pp) in the cohort — buyers who seek it out are strongly motivated by the CBD proposition, reducing discovery friction",
      "Strongest association with specific lifestyle occasions (work stress, post-exercise, evening wind-down) giving clear positioning anchors",
      "Flavour range (lemon basil, peach ginger, elderflower mint) earns consistent praise for being approachable and not 'medicinal'"
    ],
    concerns: [
      "Lowest buy-after-trying rate (68%) in the cohort — a meaningful share of triers are not converted, suggesting taste or CBD dosage doesn't land for everyone",
      "CBD category scepticism is a recurring barrier — reviewers frequently question efficacy, suggesting the functional claim needs stronger substantiation",
      "DTC-only distribution severely limits trial opportunity and impulse purchase, keeping brand awareness low"
    ],
    purchaseIntentInsight: "SKIP has the most engaged intentional buyer base — the 28pp intent gap is the smallest of all reviewed brands, meaning people who seek out a CBD drink are already receptive to SKIP specifically. However, the 68% buy-after rate (lowest in cohort) suggests a meaningful proportion of first-time triers don't convert, pointing to an expectation mismatch around CBD effects.",
    audienceProfile: "Reviewers are predominantly stress-conscious professionals aged 28–45, often women, who are already interested in functional wellness and have sought out CBD products. They use SKIP as a work-break ritual or post-exercise recovery drink — highly habitual usage patterns once adopted.",
    standoutQuote: "I've been looking for something to take the edge off during a stressful work day without reaching for coffee or wine — this is exactly that.",
    commercialOpportunity: "SKIP's DTC-only model is its biggest growth constraint — the smallest intent gap in the cohort means motivated buyers exist but can't find the product. A selective retail partnership with wellness-positioned retailers (Holland & Barrett, Planet Organic, Whole Foods) would dramatically improve trial and conversion without diluting the brand's functional positioning.",
    overallScore: 8.4,
  },

  "UNAI": {
    brand: "UNAI",
    reviewCount: 25,
    avgRating: 4.12,
    sentimentBreakdown: { POSITIVE: 19, NEGATIVE: 3, NEUTRAL: 2, MIXED: 1 },
    wouldBuyAfterRate: 80,
    wouldBuyFirstRate: 32,
    intentGap: 48,
    topThemes: ["Stress & mood management", "Adaptogenic ingredients", "Sleep and focus", "Functional efficacy", "Taste accessibility"],
    positiveSignals: [
      "Highest intent gap (48pp) paired with strong buy-after rate (80%) — those who try UNAI are highly satisfied, indicating a quality product with a communication problem",
      "Adaptogenic positioning (Uplift/Unwind range) resonates strongly with reviewers experiencing burnout or stress, creating emotional brand attachment",
      "Reviewers frequently describe behavioural changes after consumption (calmer, more focused), providing powerful testimonial material"
    ],
    concerns: [
      "Largest intent gap in the cohort (48pp) — UNAI has the most severe discovery problem, with only 32% of triers saying they'd buy it in a shop unprompted",
      "Highest negative sentiment rate (12%) among reviewed brands, with concerns around taste variance between flavours and inconsistent functional effects",
      "Adaptogens remain a niche concept — category awareness is even lower than CBD, requiring more consumer education investment"
    ],
    purchaseIntentInsight: "UNAI has the starkest contrast in the dataset: 80% would buy after trying but only 32% would buy in first place — a 48pp gap that is the widest of all reviewed brands. This is not a product quality problem (the rating is solid) but a severe awareness and shelf-presence challenge. The adaptogenic category is simply too niche for passive discovery.",
    audienceProfile: "Reviewers are predominantly women aged 25–40 experiencing workplace stress or lifestyle pressure, actively seeking natural alternatives to prescription anxiety aids or alcohol. They are highly engaged consumers who research ingredients and are willing to pay a premium for efficacy — but they need to be found, not found.",
    standoutQuote: "I've genuinely noticed a difference in how I handle stressful days since I started drinking this — I just wish I'd found it sooner.",
    commercialOpportunity: "UNAI's 48pp intent gap is the single biggest commercial opportunity in this dataset — a highly satisfied consumer base that simply can't find the product. Influencer and editorial marketing targeting the stress-wellness audience (LinkedIn, women's health media) combined with retail placement in pharmacy and health food would directly address the discovery gap and convert the existing latent demand.",
    overallScore: 7.8,
  },
};
