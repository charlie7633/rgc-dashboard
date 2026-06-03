/**
 * Data loading utilities.
 * Once the brief/dataset arrives, update these functions to parse the actual files.
 * Drop the dataset files into /data/ and update the paths below.
 */

import { Product, Review, Reviewer, DashboardStats } from "./types";

// TODO: Replace with real data loading once dataset arrives
export async function loadProducts(): Promise<Product[]> {
  // Example: return JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'))
  return [];
}

export async function loadReviews(): Promise<Review[]> {
  return [];
}

export async function loadReviewers(): Promise<Reviewer[]> {
  return [];
}

export function computeStats(
  products: Product[],
  reviews: Review[],
  reviewers: Reviewer[]
): DashboardStats {
  const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = reviews.length ? totalRatings / reviews.length : 0;

  const sentimentBreakdown = reviews.reduce(
    (acc, r) => {
      if (r.sentiment === "positive") acc.positive++;
      else if (r.sentiment === "negative") acc.negative++;
      else acc.neutral++;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  return {
    totalProducts: products.length,
    totalReviews: reviews.length,
    totalReviewers: reviewers.length,
    averageRating: Math.round(avgRating * 10) / 10,
    sentimentBreakdown,
  };
}
