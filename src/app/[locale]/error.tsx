"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Alert variant="destructive">
          <AlertTitle>{t("title")}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
        <Button onClick={() => retry()}>{t("retry")}</Button>
      </div>
    </main>
  );
}
