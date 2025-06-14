/**
 * Pagination constants for the API
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 100,
    MIN_LIMIT: 1,
    MAX_LIMIT: 1000,
    ERROR_MESSAGES: {
        MIN_LIMIT: (min: number) => `Limit must be at least ${min}`,
        MAX_LIMIT: (max: number) => `Limit cannot exceed ${max}`,
    }
} as const;