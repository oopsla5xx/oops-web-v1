/** Paths on the external Backend API (Go/Gin), appended to BACKEND_API_BASE_URL. */
export const BACKEND_API_PATHS = {
  health: "/api/v1/health",
  register: "/api/v1/auth/register",
} as const;

/** Paths on this Next.js app's own Route Handlers (the BFF layer), called from the browser. */
export const INTERNAL_API_PATHS = {
  health: "/api/health",
  register: "/api/auth/register",
} as const;

export const DEFAULT_API_TIMEOUT_MS = 10_000;

/** Correlation header — mirrors constants.HeaderRequestID in oops-api-v1. */
export const HEADER_REQUEST_ID = "X-Request-ID";
