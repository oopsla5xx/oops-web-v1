import type { z } from "zod";
import type { healthResponseSchema } from "@/schemas/health.schema";

export type Health = z.infer<typeof healthResponseSchema>;
