import { create } from "zustand";
import type { Health } from "@/types/health";
import type { ErrorCode } from "@/constants/error-codes";

interface SystemStatusState {
  status: "idle" | "loading" | "success" | "error";
  data: Health | null;
  errorCode: ErrorCode | null;
  lastCheckedAt: string | null;
  setLoading: () => void;
  setSuccess: (data: Health) => void;
  setError: (code: ErrorCode) => void;
}

export const useSystemStatusStore = create<SystemStatusState>((set) => ({
  status: "idle",
  data: null,
  errorCode: null,
  lastCheckedAt: null,
  setLoading: () => set({ status: "loading", errorCode: null }),
  setSuccess: (data) =>
    set({ status: "success", data, errorCode: null, lastCheckedAt: new Date().toISOString() }),
  setError: (code) => set({ status: "error", errorCode: code }),
}));
