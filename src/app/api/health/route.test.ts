import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/http";
import { HEADER_REQUEST_ID } from "@/constants/api";

const getHealthMock = vi.fn();
vi.mock("@/services/health", () => ({
  getHealth: (...args: unknown[]) => getHealthMock(...args),
}));

describe("GET /api/health", () => {
  it("returns 200 with the health data and an X-Request-ID header when the service call succeeds", async () => {
    const { GET } = await import("./route");
    getHealthMock.mockResolvedValueOnce({
      status: "ok",
      service: "oops-api-v1",
      version: "1.0.0",
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get(HEADER_REQUEST_ID)).toBeTruthy();
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "oops-api-v1",
      version: "1.0.0",
    });
  });

  it("forwards a generated requestId to getHealth", async () => {
    const { GET } = await import("./route");
    getHealthMock.mockResolvedValueOnce({ status: "ok", service: "oops-api-v1", version: "1.0.0" });

    await GET();

    expect(getHealthMock).toHaveBeenCalledWith(expect.any(String));
  });

  it("returns the ApiError's real code and status, without leaking internal details", async () => {
    const { GET } = await import("./route");
    getHealthMock.mockRejectedValueOnce(
      new ApiError("connect ECONNREFUSED secret-detail", "BAD_REQUEST", 400, "http://x"),
    );

    const response = await GET();

    expect(response.status).toBe(400);
    expect(response.headers.get(HEADER_REQUEST_ID)).toBeTruthy();
    const body = await response.json();
    expect(body.error.code).toBe("BAD_REQUEST");
    expect(JSON.stringify(body)).not.toContain("secret-detail");
  });

  it("falls back to a 502 UNKNOWN_ERROR when the thrown error isn't an ApiError", async () => {
    const { GET } = await import("./route");
    getHealthMock.mockRejectedValueOnce(new Error("connect ECONNREFUSED secret-detail"));

    const response = await GET();

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error.code).toBe("UNKNOWN_ERROR");
    expect(JSON.stringify(body)).not.toContain("secret-detail");
  });
});
