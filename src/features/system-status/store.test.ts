import { beforeEach, describe, expect, it } from "vitest";
import { useSystemStatusStore } from "./store";

const initialState = useSystemStatusStore.getState();

beforeEach(() => {
  useSystemStatusStore.setState(initialState, true);
});

describe("useSystemStatusStore", () => {
  it("starts idle with no data or errorCode", () => {
    const state = useSystemStatusStore.getState();

    expect(state.status).toBe("idle");
    expect(state.data).toBeNull();
    expect(state.errorCode).toBeNull();
    expect(state.lastCheckedAt).toBeNull();
  });

  it("setLoading moves to loading and clears any previous errorCode", () => {
    useSystemStatusStore.getState().setError("UNKNOWN_ERROR");

    useSystemStatusStore.getState().setLoading();

    const state = useSystemStatusStore.getState();
    expect(state.status).toBe("loading");
    expect(state.errorCode).toBeNull();
  });

  it("setSuccess stores the data, clears the errorCode, and stamps lastCheckedAt", () => {
    const health = { status: "ok", service: "oops-api-v1", version: "1.0.0" };

    useSystemStatusStore.getState().setSuccess(health);

    const state = useSystemStatusStore.getState();
    expect(state.status).toBe("success");
    expect(state.data).toEqual(health);
    expect(state.errorCode).toBeNull();
    expect(state.lastCheckedAt).not.toBeNull();
  });

  it("setError stores the error code and moves to error status", () => {
    useSystemStatusStore.getState().setError("NETWORK_ERROR");

    const state = useSystemStatusStore.getState();
    expect(state.status).toBe("error");
    expect(state.errorCode).toBe("NETWORK_ERROR");
  });
});
