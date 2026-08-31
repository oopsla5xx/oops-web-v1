import { afterEach, describe, expect, it, vi } from "vitest";
import { CLIENT_ERROR_CODES } from "@/constants/error-codes";
import { ApiError, httpGet } from "./http";

describe("httpGet", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed JSON body on a successful response", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await httpGet("http://localhost:8080/api/v1/health");

    expect(result).toEqual({ ok: true });
  });

  it("throws an ApiError with the backend's real error code when the error body matches the envelope", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            success: false,
            error: { code: "BAD_REQUEST", message: "bad request" },
          }),
          {
            status: 400,
          },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(httpGet("http://localhost:8080/api/v1/health")).rejects.toMatchObject({
      code: "BAD_REQUEST",
      status: 400,
      url: "http://localhost:8080/api/v1/health",
    });
  });

  it("throws an ApiError with UNKNOWN_ERROR when the error body doesn't match the envelope", async () => {
    const fetchMock = vi.fn(async () => new Response("Internal Server Error", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(httpGet("http://localhost:8080/api/v1/health")).rejects.toMatchObject({
      code: CLIENT_ERROR_CODES.UNKNOWN_ERROR,
      status: 500,
    });
  });

  it("throws an ApiError with NETWORK_ERROR when fetch itself fails", async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(httpGet("http://localhost:8080/api/v1/health")).rejects.toMatchObject({
      code: CLIENT_ERROR_CODES.NETWORK_ERROR,
    });
  });

  it("throws an ApiError with TIMEOUT when the request exceeds timeoutMs", async () => {
    const fetchMock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const abortError = new Error("This operation was aborted");
            abortError.name = "AbortError";
            reject(abortError);
          });
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      httpGet("http://localhost:8080/api/v1/health", { timeoutMs: 5 }),
    ).rejects.toMatchObject({
      code: CLIENT_ERROR_CODES.TIMEOUT,
    });
  });
});

describe("ApiError", () => {
  it("is a real Error instance carrying code, status and url", () => {
    const error = new ApiError("boom", "RESOURCE_NOT_FOUND", 404, "http://localhost:8080/x");

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("RESOURCE_NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.url).toBe("http://localhost:8080/x");
  });
});
