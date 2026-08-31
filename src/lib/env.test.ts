import { describe, expect, it } from "vitest";
import { loadEnv } from "./env";

describe("loadEnv", () => {
  it("returns the parsed env when BACKEND_API_BASE_URL is a valid URL", () => {
    const result = loadEnv({ BACKEND_API_BASE_URL: "http://localhost:8080" });

    expect(result).toEqual({ BACKEND_API_BASE_URL: "http://localhost:8080" });
  });

  it("throws a clear error when BACKEND_API_BASE_URL is missing", () => {
    expect(() => loadEnv({})).toThrow(/BACKEND_API_BASE_URL/);
  });

  it("throws a clear error when BACKEND_API_BASE_URL is not a valid URL", () => {
    expect(() => loadEnv({ BACKEND_API_BASE_URL: "not-a-url" })).toThrow(/BACKEND_API_BASE_URL/);
  });

  it("preserves the original Zod error as the cause", () => {
    try {
      loadEnv({});
      throw new Error("expected loadEnv to throw");
    } catch (error) {
      expect((error as Error).cause).toBeDefined();
    }
  });
});
