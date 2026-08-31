import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string().optional(),
});

export const apiEnvelopeErrorSchema = z
  .object({
    success: z.boolean().optional(),
    error: apiErrorSchema.optional(),
  })
  .loose();

export function getApiErrorCode(body: unknown): string | undefined {
  const result = apiEnvelopeErrorSchema.safeParse(body);
  return result.success ? result.data.error?.code : undefined;
}
