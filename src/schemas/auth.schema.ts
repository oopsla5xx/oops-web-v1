import { z } from "zod";

export const registerRequestSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_-]+$/),
  email: z.email(),
  password: z.string().min(10).max(72),
});

export const userResponseSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  username: z.string(),
  email: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().optional(),
});
