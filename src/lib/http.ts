import { CLIENT_ERROR_CODES } from "@/constants/error-codes";
import { DEFAULT_API_TIMEOUT_MS } from "@/constants/api";
import { getApiErrorCode, getApiErrorField } from "@/schemas/api-response.schema";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly url?: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface HttpRequestOptions {
  timeoutMs?: number;
  /** Extension point for future auth headers — no auth is wired in yet. */
  headers?: HeadersInit;
}

async function request(
  method: "GET" | "POST",
  url: string,
  body: unknown,
  options: HttpRequestOptions,
): Promise<unknown> {
  const { timeoutMs = DEFAULT_API_TIMEOUT_MS, headers } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json", ...headers } : headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        `Request to ${url} timed out after ${timeoutMs}ms`,
        CLIENT_ERROR_CODES.TIMEOUT,
        undefined,
        url,
      );
    }
    throw new ApiError(
      `Request to ${url} failed`,
      CLIENT_ERROR_CODES.NETWORK_ERROR,
      undefined,
      url,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const code = getApiErrorCode(errorBody);
    const field = getApiErrorField(errorBody);
    throw new ApiError(
      code
        ? `${method} ${url} failed: ${code}`
        : `${method} ${url} failed with status ${response.status}`,
      code ?? CLIENT_ERROR_CODES.UNKNOWN_ERROR,
      response.status,
      url,
      field,
    );
  }

  return await response.json();
}

export async function httpGet(url: string, options: HttpRequestOptions = {}): Promise<unknown> {
  return request("GET", url, undefined, options);
}

export async function httpPost(
  url: string,
  body: unknown,
  options: HttpRequestOptions = {},
): Promise<unknown> {
  return request("POST", url, body, options);
}
