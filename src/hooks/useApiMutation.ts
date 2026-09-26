import { useCallback, useState } from "react";
import { CLIENT_ERROR_CODES, type ErrorCode } from "@/constants/error-codes";
import { ApiError } from "@/lib/http";

export type MutationStatus = "idle" | "loading" | "success" | "error";

export interface FieldError {
  field: string;
  code: ErrorCode;
}

export type MutationResult<TData> =
  | { success: true; data: TData }
  | { success: false; errorCode: ErrorCode; fieldError: FieldError | null };

export function useApiMutation<TInput, TData>(mutationFn: (input: TInput) => Promise<TData>) {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [data, setData] = useState<TData | null>(null);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [fieldError, setFieldError] = useState<FieldError | null>(null);

  const mutate = useCallback(
    async (input: TInput): Promise<MutationResult<TData>> => {
      setStatus("loading");
      setErrorCode(null);
      setFieldError(null);
      try {
        const result = await mutationFn(input);
        setData(result);
        setStatus("success");
        return { success: true, data: result };
      } catch (error) {
        const code: ErrorCode =
          error instanceof ApiError ? (error.code as ErrorCode) : CLIENT_ERROR_CODES.UNKNOWN_ERROR;
        const field = error instanceof ApiError ? error.field : undefined;
        setStatus("error");
        if (field) {
          const nextFieldError = { field, code };
          setFieldError(nextFieldError);
          return { success: false, errorCode: code, fieldError: nextFieldError };
        }
        setErrorCode(code);
        return { success: false, errorCode: code, fieldError: null };
      }
    },
    [mutationFn],
  );

  return { status, data, errorCode, fieldError, mutate };
}
