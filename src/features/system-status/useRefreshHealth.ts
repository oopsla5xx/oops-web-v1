import { useCallback } from "react";
import { INTERNAL_API_PATHS } from "@/constants/api";
import { CLIENT_ERROR_CODES, type ErrorCode } from "@/constants/error-codes";
import { ApiError, httpGet } from "@/lib/http";
import { healthResponseSchema } from "@/schemas/health.schema";
import { useSystemStatusStore } from "./store";

export function useRefreshHealth() {
  const status = useSystemStatusStore((state) => state.status);
  const setLoading = useSystemStatusStore((state) => state.setLoading);
  const setSuccess = useSystemStatusStore((state) => state.setSuccess);
  const setError = useSystemStatusStore((state) => state.setError);

  const refresh = useCallback(async () => {
    setLoading();
    try {
      const json = await httpGet(INTERNAL_API_PATHS.health);
      setSuccess(healthResponseSchema.parse(json));
    } catch (error) {
      const code: ErrorCode =
        error instanceof ApiError ? (error.code as ErrorCode) : CLIENT_ERROR_CODES.UNKNOWN_ERROR;
      setError(code);
    }
  }, [setLoading, setSuccess, setError]);

  return { status, refresh };
}
