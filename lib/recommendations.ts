import type { MarketplacePost } from "@/types/domain";

export type RecommendationContext = {
  location?: string;
  categoryId?: string;
  query?: string;
  preferredType?: MarketplacePost["type"];
};

function normalize(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function contains(value: string, needle: string) {
  return Boolean(needle) && normalize(value).includes(needle);
}

/**
 * A deliberately simple, deterministic recommender. It is easy to explain to
 * users and does not require a new backend service or personal data store.
 * Location and category are strongest, then text relevance and listing type.
 */
export function recommendationScore(
  post: MarketplacePost,
  context: RecommendationContext,
) {
  const location = normalize(context.location);
  const categoryId = normalize(context.categoryId);
  const query = normalize(context.query);
  const postLocation = normalize(post.locationLabel);
  const haystack = `${post.productName} ${post.description} ${post.categoryLabel}`;
  let score = 0;

  if (location && (postLocation === location || postLocation.includes(location) || location.includes(postLocation))) score += 40;
  if (categoryId && normalize(post.categoryId) === categoryId) score += 30;
  if (query && (contains(haystack, query) || contains(postLocation, query))) score += 25;
  if (context.preferredType && post.type === context.preferredType) score += 10;
  if (post.status === "APPROVED") score += 5;
  if (post.imageUrl) score += 2;

  return score;
}

export function sortRecommendedPosts(
  posts: MarketplacePost[],
  context: RecommendationContext,
) {
  return [...posts].sort((a, b) => {
    const scoreDifference = recommendationScore(b, context) - recommendationScore(a, context);
    if (scoreDifference !== 0) return scoreDifference;
    return b.createdAtLabel.localeCompare(a.createdAtLabel);
  });
}
