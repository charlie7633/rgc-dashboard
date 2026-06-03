export interface Product {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  productId: string;
  reviewer: string;
  rating: number;
  text: string;
  date: string;
  sentiment?: "positive" | "neutral" | "negative";
  themes?: string[];
}

export interface Reviewer {
  id: string;
  name: string;
  reviewCount: number;
  averageRating: number;
  trustScore?: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalReviews: number;
  totalReviewers: number;
  averageRating: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface AnalysisResult {
  sentiment: string;
  themes: string[];
  summary: string;
  score: number;
}
