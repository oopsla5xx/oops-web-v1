"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRefreshHealth } from "./useRefreshHealth";

export function RefreshButton() {
  const t = useTranslations("systemStatus");
  const { status, refresh } = useRefreshHealth();

  return (
    <Button onClick={refresh} disabled={status === "loading"} size="sm">
      {status === "loading" ? t("refreshing") : t("refresh")}
    </Button>
  );
}
