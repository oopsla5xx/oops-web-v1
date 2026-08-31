import { CLIENT_ERROR_CODES } from "@/constants/error-codes";
import { DEFAULT_API_TIMEOUT_MS } from "@/constants/api";
import { getApiErrorCode } from "@/schemas/api-response.schema";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly url?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface HttpGetOptions {
  timeoutMs?: number;
  /** Extension point for future auth headers — no auth is wired in yet. */
  headers?: HeadersInit;
}

export async function httpGet(url: string, options: HttpGetOptions = {}): Promise<unknown> {
  const { timeoutMs = DEFAULT_API_TIMEOUT_MS, headers } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { headers, signal: controller.signal });
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
    const body = await response.json().catch(() => null);
    const code = getApiErrorCode(body);
    throw new ApiError(
      code ? `GET ${url} failed: ${code}` : `GET ${url} failed with status ${response.status}`,
      code ?? CLIENT_ERROR_CODES.UNKNOWN_ERROR,
      response.status,
      url,
    );
  }

  return await response.json();
}
