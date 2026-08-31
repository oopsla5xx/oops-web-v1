import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRefreshHealth } from "./useRefreshHealth";
import { useSystemStatusStore } from "./store";

const initialState = useSystemStatusStore.getState();

beforeEach(() => {
  useSystemStatusStore.setState(initialState, true);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useRefreshHealth", () => {
  it("exposes the store's current status", () => {
    const { result } = renderHook(() => useRefreshHealth());

    expect(result.current.status).toBe("idle");
  });

  it("refresh() sets success with the fetched data on a successful call", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ status: "ok", service: "oops-api-v1", version: "1.0.0" }), {
            status: 200,
          }),
      ),
    );

    const { result } = renderHook(() => useRefreshHealth());
    await act(() => result.current.refresh());

    expect(useSystemStatusStore.getState().status).toBe("success");
    expect(useSystemStatusStore.getState().data).toEqual({
      status: "ok",
      service: "oops-api-v1",
      version: "1.0.0",
    });
  });

  it("refresh() sets the errorCode to the backend's real error code on a failed call", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { code: "INTERNAL_SERVER_ERROR" } }), {
            status: 502,
          }),
      ),
    );

    const { result } = renderHook(() => useRefreshHealth());
    await act(() => result.current.refresh());

    expect(useSystemStatusStore.getState().status).toBe("error");
    expect(useSystemStatusStore.getState().errorCode).toBe("INTERNAL_SERVER_ERROR");
  });

  it("refresh() sets the errorCode to NETWORK_ERROR when fetch itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    const { result } = renderHook(() => useRefreshHealth());
    await act(() => result.current.refresh());

    expect(useSystemStatusStore.getState().errorCode).toBe("NETWORK_ERROR");
  });
});
