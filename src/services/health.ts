import { BACKEND_API_PATHS, HEADER_REQUEST_ID } from "@/constants/api";
import { getEnv } from "@/lib/env";
import { httpGet } from "@/lib/http";
import { healthResponseSchema } from "@/schemas/health.schema";
import type { Health } from "@/types/health";

export async function getHealth(requestId?: string): Promise<Health> {
  const { BACKEND_API_BASE_URL } = getEnv();
  const json = await httpGet(`${BACKEND_API_BASE_URL}${BACKEND_API_PATHS.health}`, {
    ...(requestId ? { headers: { [HEADER_REQUEST_ID]: requestId } } : {}),
  });
  return healthResponseSchema.parse(json);
}
