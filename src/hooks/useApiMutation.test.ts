import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/http";
import { useApiMutation } from "./useApiMutation";

describe("useApiMutation", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useApiMutation(vi.fn()));

    expect(result.current.status).toBe("idle");
  });

  it("sets success and returns the data on a successful call", async () => {
    const mutationFn = vi.fn(async (input: { id: string }) => ({ id: input.id, ok: true }));
    const { result } = renderHook(() => useApiMutation(mutationFn));

    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.mutate({ id: "1" });
    });

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual({ id: "1", ok: true });
    expect(outcome).toEqual({ success: true, data: { id: "1", ok: true } });
  });

  it("sets fieldError (not errorCode) when the thrown ApiError carries a field", async () => {
    const mutationFn = vi.fn(async () => {
      throw new ApiError("conflict", "EMAIL_ALREADY_TAKEN", 409, "http://x", "email");
    });
    const { result } = renderHook(() => useApiMutation(mutationFn));

    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.mutate(undefined);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.fieldError).toEqual({ field: "email", code: "EMAIL_ALREADY_TAKEN" });
    expect(result.current.errorCode).toBeNull();
    expect(outcome).toEqual({
      success: false,
      errorCode: "EMAIL_ALREADY_TAKEN",
      fieldError: { field: "email", code: "EMAIL_ALREADY_TAKEN" },
    });
  });

  it("sets errorCode (not fieldError) when the thrown ApiError has no field", async () => {
    const mutationFn = vi.fn(async () => {
      throw new ApiError("boom", "INTERNAL_SERVER_ERROR", 500, "http://x");
    });
    const { result } = renderHook(() => useApiMutation(mutationFn));

    await act(async () => {
      await result.current.mutate(undefined);
    });

    expect(result.current.errorCode).toBe("INTERNAL_SERVER_ERROR");
    expect(result.current.fieldError).toBeNull();
  });

  it("falls back to UNKNOWN_ERROR when the thrown error isn't an ApiError", async () => {
    const mutationFn = vi.fn(async () => {
      throw new Error("boom");
    });
    const { result } = renderHook(() => useApiMutation(mutationFn));

    await act(async () => {
      await result.current.mutate(undefined);
    });

    expect(result.current.errorCode).toBe("UNKNOWN_ERROR");
  });
});
