import { describe, expect, it } from "vitest";
import { getApiErrorCode } from "./api-response.schema";

describe("getApiErrorCode", () => {
  it("extracts the code from a full backend envelope", () => {
    const body = { success: false, error: { code: "BAD_REQUEST", message: "bad request" } };

    expect(getApiErrorCode(body)).toBe("BAD_REQUEST");
  });

  it("extracts the code from a minimal BFF error body (no success/message)", () => {
    const body = { error: { code: "UNKNOWN_ERROR" } };

    expect(getApiErrorCode(body)).toBe("UNKNOWN_ERROR");
  });

  it("returns undefined when there is no error field", () => {
    const body = { success: true, data: { status: "ok" } };

    expect(getApiErrorCode(body)).toBeUndefined();
  });

  it("returns undefined for non-object or malformed bodies", () => {
    expect(getApiErrorCode(null)).toBeUndefined();
    expect(getApiErrorCode("plain text")).toBeUndefined();
    expect(getApiErrorCode({ error: { message: "no code field" } })).toBeUndefined();
  });
});
