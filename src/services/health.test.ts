import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ BACKEND_API_BASE_URL: "http://localhost:8080" }),
}));

const httpGetMock = vi.fn();
vi.mock("@/lib/http", () => ({
  httpGet: (...args: unknown[]) => httpGetMock(...args),
}));

describe("getHealth", () => {
  it("fetches the health endpoint from the configured base URL and returns the parsed data", async () => {
    const { getHealth } = await import("./health");
    httpGetMock.mockResolvedValueOnce({
      status: "ok",
      service: "oops-api-v1",
      version: "1.0.0",
    });

    const result = await getHealth();

    expect(httpGetMock).toHaveBeenCalledWith("http://localhost:8080/api/v1/health", {});
    expect(result).toEqual({ status: "ok", service: "oops-api-v1", version: "1.0.0" });
  });

  it("forwards the given requestId as the X-Request-ID header", async () => {
    const { getHealth } = await import("./health");
    httpGetMock.mockResolvedValueOnce({
      status: "ok",
      service: "oops-api-v1",
      version: "1.0.0",
    });

    await getHealth("req-123");

    expect(httpGetMock).toHaveBeenCalledWith("http://localhost:8080/api/v1/health", {
      headers: { "X-Request-ID": "req-123" },
    });
  });

  it("throws when the response does not match the health schema", async () => {
    const { getHealth } = await import("./health");
    httpGetMock.mockResolvedValueOnce({ status: "ok" });

    await expect(getHealth()).rejects.toThrow();
  });
});
