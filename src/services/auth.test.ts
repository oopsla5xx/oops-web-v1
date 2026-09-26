import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ BACKEND_API_BASE_URL: "http://localhost:8080" }),
}));

const httpPostMock = vi.fn();
vi.mock("@/lib/http", () => ({
  httpPost: (...args: unknown[]) => httpPostMock(...args),
}));

const validInput = {
  username: "ada-lovelace",
  email: "ada@example.com",
  password: "correct-horse-battery",
};

const validUser = {
  id: "1",
  first_name: "Ada",
  last_name: "Lovelace",
  username: "ada-lovelace",
  email: "ada@example.com",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

// oops-api-v1 wraps success responses in {success, data} (internal/shared/response.Created) —
// unlike GET /health, which is a deliberate flat exception (see its handler comment).
const validEnvelope = { success: true, data: validUser };

describe("registerUser", () => {
  it("posts to the configured base URL and returns the unwrapped user", async () => {
    const { registerUser } = await import("./auth");
    httpPostMock.mockResolvedValueOnce(validEnvelope);

    const result = await registerUser(validInput);

    expect(httpPostMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/register",
      validInput,
      {},
    );
    expect(result).toEqual(validUser);
  });

  it("forwards the given requestId as the X-Request-ID header", async () => {
    const { registerUser } = await import("./auth");
    httpPostMock.mockResolvedValueOnce(validEnvelope);

    await registerUser(validInput, "req-123");

    expect(httpPostMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/register",
      validInput,
      { headers: { "X-Request-ID": "req-123" } },
    );
  });

  it("throws when the envelope's data does not match the user schema", async () => {
    const { registerUser } = await import("./auth");
    httpPostMock.mockResolvedValueOnce({ success: true, data: { id: "1" } });

    await expect(registerUser(validInput)).rejects.toThrow();
  });
});
