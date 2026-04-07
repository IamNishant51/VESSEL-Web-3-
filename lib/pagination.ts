/**
 * Pagination utilities for database queries
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;

/**
 * Validate and normalize pagination parameters
 */
export function validatePaginationParams(params: PaginationParams): {
  page: number;
  limit: number;
  sort: Record<string, 1 | -1>;
} {
  let page = DEFAULT_PAGE;
  let limit = DEFAULT_LIMIT;

  if (params.page && typeof params.page === "number" && params.page > 0) {
    page = Math.floor(params.page);
  }

  if (params.limit && typeof params.limit === "number") {
    limit = Math.max(MIN_LIMIT, Math.min(Math.floor(params.limit), MAX_LIMIT));
  }

  const sort = params.sort || { createdAt: -1 };

  return { page, limit, sort };
}

/**
 * Calculate skip and limit for MongoDB query
 */
export function calculateSkipLimit(page: number, limit: number): { skip: number; limit: number } {
  const skip = (page - 1) * limit;
  return { skip, limit };
}

/**
 * Build paginated response
 */
export function buildPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    items,
    page,
    limit,
    total,
    totalPages,
    hasMore,
  };
}

/**
 * Execute paginated query with MongoDB
 */
export async function executePaginatedQuery<T>(
  query: any,
  page: number,
  limit: number,
  sort: Record<string, 1 | -1> = { createdAt: -1 }
): Promise<{ items: T[]; total: number }> {
  const { skip } = calculateSkipLimit(page, limit);

  const [items, total] = await Promise.all([
    query.skip(skip).limit(limit).sort(sort).lean(),
    query.model.countDocuments(query.getFilter()),
  ]);

  return { items, total };
}
