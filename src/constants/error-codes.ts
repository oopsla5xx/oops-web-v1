/** Mirrors internal/shared/constants/error_code.go in oops-api-v1. Keep in sync by hand. */
export const BACKEND_ERROR_CODES = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  GATEWAY_TIMEOUT: "GATEWAY_TIMEOUT",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
} as const;

/** Errors that never reach a backend response (network down, timeout, unparseable body). */
export const CLIENT_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type BackendErrorCode = (typeof BACKEND_ERROR_CODES)[keyof typeof BACKEND_ERROR_CODES];
export type ClientErrorCode = (typeof CLIENT_ERROR_CODES)[keyof typeof CLIENT_ERROR_CODES];
export type ErrorCode = BackendErrorCode | ClientErrorCode;
