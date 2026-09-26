import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/http";
import { HEADER_REQUEST_ID } from "@/constants/api";

const registerUserMock = vi.fn();
vi.mock("@/services/auth", () => ({
  registerUser: (...args: unknown[]) => registerUserMock(...args),
}));

function postRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validInput = {
  username: "ada-lovelace",
  email: "ada@example.com",
  password: "correct-horse-battery",
};

describe("POST /api/auth/register", () => {
  it("returns 201 with the created user and an X-Request-ID header when the service call succeeds", async () => {
    const { POST } = await import("./route");
    registerUserMock.mockResolvedValueOnce({
      id: "1",
      first_name: "Ada",
      last_name: "Lovelace",
      username: "ada-lovelace",
      email: "ada@example.com",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });

    const response = await POST(postRequest(validInput));

    expect(response.status).toBe(201);
    expect(response.headers.get(HEADER_REQUEST_ID)).toBeTruthy();
    const body = await response.json();
    expect(body).toMatchObject({ username: "ada-lovelace", email: "ada@example.com" });
    expect(body).not.toHaveProperty("password");
  });

  it("forwards the parsed body and a generated requestId to registerUser", async () => {
    const { POST } = await import("./route");
    registerUserMock.mockResolvedValueOnce({
      id: "1",
      first_name: "Ada",
      last_name: "Lovelace",
      username: "ada-lovelace",
      email: "ada@example.com",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });

    await POST(postRequest(validInput));

    expect(registerUserMock).toHaveBeenCalledWith(validInput, expect.any(String));
  });

  it("returns the ApiError's real code, status and field, without leaking internal details", async () => {
    const { POST } = await import("./route");
    registerUserMock.mockRejectedValueOnce(
      new ApiError(
        "conflict detail: row already exists",
        "EMAIL_ALREADY_TAKEN",
        409,
        "http://x",
        "email",
      ),
    );

    const response = await POST(postRequest(validInput));

    expect(response.status).toBe(409);
    expect(response.headers.get(HEADER_REQUEST_ID)).toBeTruthy();
    const body = await response.json();
    expect(body.error).toEqual({ code: "EMAIL_ALREADY_TAKEN", field: "email" });
    expect(JSON.stringify(body)).not.toContain("row already exists");
  });

  it("omits field from the error body when the ApiError doesn't carry one", async () => {
    const { POST } = await import("./route");
    registerUserMock.mockRejectedValueOnce(
      new ApiError("bad request", "VALIDATION_ERROR", 400, "http://x"),
    );

    const response = await POST(postRequest(validInput));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toEqual({ code: "VALIDATION_ERROR" });
  });

  it("falls back to a 502 UNKNOWN_ERROR when the thrown error isn't an ApiError", async () => {
    const { POST } = await import("./route");
    registerUserMock.mockRejectedValueOnce(new Error("connect ECONNREFUSED secret-detail"));

    const response = await POST(postRequest(validInput));

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error.code).toBe("UNKNOWN_ERROR");
    expect(JSON.stringify(body)).not.toContain("secret-detail");
  });
});
