import { BACKEND_API_PATHS, HEADER_REQUEST_ID } from "@/constants/api";
import { getEnv } from "@/lib/env";
import { httpPost } from "@/lib/http";
import { userResponseSchema } from "@/schemas/auth.schema";
import type { RegisterRequest, User } from "@/types/user";

export async function registerUser(input: RegisterRequest, requestId?: string): Promise<User> {
  const { BACKEND_API_BASE_URL } = getEnv();
  const json = (await httpPost(`${BACKEND_API_BASE_URL}${BACKEND_API_PATHS.register}`, input, {
    ...(requestId ? { headers: { [HEADER_REQUEST_ID]: requestId } } : {}),
  })) as { data?: unknown };
  // Unlike GET /health (a deliberate flat exception — see its handler comment), this endpoint
  // uses oops-api-v1's standard {success, data} envelope (internal/shared/response.Created).
  return userResponseSchema.parse(json.data);
}
