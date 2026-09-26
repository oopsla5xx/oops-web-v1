import type { z } from "zod";
import type { registerRequestSchema, userResponseSchema } from "@/schemas/auth.schema";

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type User = z.infer<typeof userResponseSchema>;
