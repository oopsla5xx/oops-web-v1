import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRegister } from "./useRegister";

afterEach(() => {
  vi.unstubAllGlobals();
});

const validInput = {
  username: "ada-lovelace",
  email: "ada@example.com",
  password: "correct-horse-battery",
};

describe("useRegister", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useRegister());

    expect(result.current.status).toBe("idle");
  });

  it("register() sets success with the created user on a successful call", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              id: "1",
              first_name: "Ada",
              last_name: "Lovelace",
              username: "ada-lovelace",
              email: "ada@example.com",
              created_at: "2026-01-01T00:00:00Z",
              updated_at: "2026-01-01T00:00:00Z",
            }),
            { status: 201 },
          ),
      ),
    );

    const { result } = renderHook(() => useRegister());
    await act(() => result.current.register(validInput));

    expect(result.current.status).toBe("success");
    expect(result.current.user?.email).toBe("ada@example.com");
  });

  it("register() sets fieldError when the backend error carries a field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { code: "EMAIL_ALREADY_TAKEN", field: "email" } }), {
            status: 409,
          }),
      ),
    );

    const { result } = renderHook(() => useRegister());
    await act(() => result.current.register(validInput));

    expect(result.current.status).toBe("error");
    expect(result.current.fieldError).toEqual({ field: "email", code: "EMAIL_ALREADY_TAKEN" });
    expect(result.current.errorCode).toBeNull();
  });

  it("register() sets errorCode (not fieldError) when the backend error has no field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { code: "INTERNAL_SERVER_ERROR" } }), {
            status: 500,
          }),
      ),
    );

    const { result } = renderHook(() => useRegister());
    await act(() => result.current.register(validInput));

    expect(result.current.errorCode).toBe("INTERNAL_SERVER_ERROR");
    expect(result.current.fieldError).toBeNull();
  });

  it("register() sets errorCode to NETWORK_ERROR when fetch itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    const { result } = renderHook(() => useRegister());
    await act(() => result.current.register(validInput));

    expect(result.current.errorCode).toBe("NETWORK_ERROR");
  });
});
