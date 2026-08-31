import { describe, expect, it } from "vitest";
import { healthResponseSchema } from "./health.schema";

describe("healthResponseSchema", () => {
  it("parses a valid health response", () => {
    const input = { status: "ok", service: "oops-api-v1", version: "1.0.0" };

    const result = healthResponseSchema.parse(input);

    expect(result).toEqual(input);
  });

  it("rejects a payload missing required fields", () => {
    const input = { status: "ok" };

    expect(() => healthResponseSchema.parse(input)).toThrow();
  });
});
