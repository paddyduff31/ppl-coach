import type {
  GetNextPageParamFunction,
  GetPreviousPageParamFunction,
} from '@tanstack/react-query';

// Common pagination types
export type PaginateQuery<T> = {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

type KeyParams = {
  [key: string]: any;
};

export const DEFAULT_LIMIT = 10;

/**
 * Generate consistent query keys for React Query
 * @param key - Base key for the query
 * @param params - Optional parameters to include in the key
 * @returns Array suitable for React Query key
 */
export function getQueryKey<T extends KeyParams>(key: string, params?: T) {
  return [key, ...(params ? [params] : [])];
}

/**
 * Flatten paginated results for use in FlatList or other components
 * @param pages - Array of paginated pages from infinite query
 * @returns Flattened array of all results
 */
export function normalizePages<T>(pages?: PaginateQuery<T>[]): T[] {
  return pages
    ? pages.reduce((prev: T[], current) => [...prev, ...current.results], [])
    : [];
}

/**
 * Extract URL parameters from a pagination URL
 * @param url - The URL string to parse
 * @returns Object containing URL parameters or null
 */
export function getUrlParameters(
  url: string | null
): { [k: string]: string } | null {
  if (url === null) {
    return null;
  }
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  const params: { [k: string]: string } = {};
  let match;
  while ((match = regex.exec(url))) {
    if (match[1] !== null) {
      params[match[1]] = match[2];
    }
  }
  return params;
}

/**
 * Extract previous page parameter for infinite queries
 */
export const getPreviousPageParam: GetPreviousPageParamFunction<
  unknown,
  PaginateQuery<unknown>
> = (page) => getUrlParameters(page.previous)?.offset ?? null;

/**
 * Extract next page parameter for infinite queries
 */
export const getNextPageParam: GetNextPageParamFunction<
  unknown,
  PaginateQuery<unknown>
> = (page) => getUrlParameters(page.next)?.offset ?? null;

/**
 * Create search parameters for API calls
 * @param params - Object of parameters to convert
 * @returns URLSearchParams instance
 */
export function createSearchParams(params: Record<string, any>): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams;
}
