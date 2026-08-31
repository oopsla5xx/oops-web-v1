import { z } from "zod";

const envSchema = z.object({
  BACKEND_API_BASE_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment configuration:\n${issues}`, {
      cause: result.error,
    });
  }

  return result.data;
}

let cachedEnv: Env | undefined;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = loadEnv(process.env);
  }
  return cachedEnv;
}
