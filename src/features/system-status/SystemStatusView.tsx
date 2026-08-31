"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Health } from "@/types/health";
import type { ErrorCode } from "@/constants/error-codes";
import { RefreshButton } from "./RefreshButton";
import { useSystemStatusStore } from "./store";

interface SystemStatusViewProps {
  /** Data from the initial SSR fetch, or null if that fetch failed. */
  initialData: Health | null;
  /** Error code from the initial SSR fetch, when initialData is null. */
  initialErrorCode?: ErrorCode | null;
}

export function SystemStatusView({ initialData, initialErrorCode }: SystemStatusViewProps) {
  const t = useTranslations("systemStatus");
  const tErrors = useTranslations("errors");
  const tErrorPage = useTranslations("errorPage");
  const storeStatus = useSystemStatusStore((state) => state.status);
  const storeData = useSystemStatusStore((state) => state.data);
  const storeErrorCode = useSystemStatusStore((state) => state.errorCode);
  const lastCheckedAt = useSystemStatusStore((state) => state.lastCheckedAt);

  // Until a refresh happens, the store stays "idle" — fall back to what the
  // server-rendered initial load produced (success or error) instead.
  const status = storeStatus !== "idle" ? storeStatus : initialData ? "success" : "error";
  const errorCode = storeStatus !== "idle" ? storeErrorCode : (initialErrorCode ?? null);
  const health = storeData ?? initialData;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "loading" && (
          <div className="space-y-2" data-testid="status-loading">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {status === "error" && (
          <Alert variant="destructive" data-testid="status-error">
            <AlertTitle>{tErrorPage("title")}</AlertTitle>
            <AlertDescription>{errorCode ? tErrors(errorCode) : null}</AlertDescription>
          </Alert>
        )}

        {status !== "loading" && status !== "error" && health && (
          <dl className="text-sm" data-testid="status-data">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("status")}</dt>
              <dd>{health.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("service")}</dt>
              <dd>{health.service}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("version")}</dt>
              <dd>{health.version}</dd>
            </div>
          </dl>
        )}

        {lastCheckedAt && (
          <p className="text-xs text-muted-foreground">
            {t("lastChecked", { timestamp: lastCheckedAt })}
          </p>
        )}

        <RefreshButton />
      </CardContent>
    </Card>
  );
}
