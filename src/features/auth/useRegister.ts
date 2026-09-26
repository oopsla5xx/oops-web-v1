import { useApiMutation } from "@/hooks/useApiMutation";
import { INTERNAL_API_PATHS } from "@/constants/api";
import { httpPost } from "@/lib/http";
import { userResponseSchema } from "@/schemas/auth.schema";
import type { RegisterRequest, User } from "@/types/user";

async function register(input: RegisterRequest): Promise<User> {
  const json = await httpPost(INTERNAL_API_PATHS.register, input);
  return userResponseSchema.parse(json);
}

export function useRegister() {
  const { status, data, errorCode, fieldError, mutate } = useApiMutation(register);
  return { status, user: data, errorCode, fieldError, register: mutate };
}
