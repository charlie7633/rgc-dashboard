/**
 * Flexible column resolver — tries multiple likely column names in order.
 * Used by chart components to handle varied CSV schemas without re-upload.
 */

export function resolveCol(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== "") return row[k];
  }
  return "";
}

export const PRODUCT_KEYS   = ["product_name", "product", "productName", "name", "item", "title", "brand", "category", "Product Name", "Product Category"];
export const RATING_KEYS    = ["rating", "score", "stars", "review_score", "avg_rating", "Rating", "Score"];
export const NUMERIC_KEYS   = ["rating", "score", "stars", "price", "Price per Unit", "unit_price", "quantity", "Quantity", "total_amount", "Total Amount", "amount", "value", "sales"];
export const REVIEWER_KEYS  = ["reviewer_id", "reviewer", "user_id", "userId", "personId", "customer_id", "Customer ID", "email", "user"];
export const DATE_KEYS      = ["review_date", "date", "Date", "created_at", "createdAt", "Order Date", "timestamp"];
export const TEXT_KEYS      = ["transcript_text", "review", "text", "body", "comment", "transcript", "Review Text"];
export const SENTIMENT_KEYS = ["sentiment", "Sentiment"];
export const CATEGORY_KEYS  = ["category", "Category", "product_category", "Product Category", "subcategory", "type", "department"];

/** Returns the first key from a row that has a non-empty numeric value */
export function resolveNumericCol(row: Record<string, string>): { key: string; value: number } | null {
  for (const k of NUMERIC_KEYS) {
    const v = parseFloat(row[k] ?? "");
    if (!isNaN(v) && v > 0) return { key: k, value: v };
  }
  // Last resort: first numeric-looking column
  for (const [k, v] of Object.entries(row)) {
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0) return { key: k, value: n };
  }
  return null;
}
