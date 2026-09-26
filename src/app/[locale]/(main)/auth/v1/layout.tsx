import Image from "next/image";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";
import { APP_CONFIG } from "@/constants/app-config";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const t = useTranslations("authLayout");

  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        <div className="relative order-2 hidden h-full overflow-hidden rounded-2xl bg-secondary lg:flex">
          <Image
            src="/banner/auth-register.png"
            priority
            fill
            className="w-full h-full"
            alt="Oops Banner"
          />

          <div className="absolute top-10 space-y-1 px-10 text-foreground">
            <Image
              src="/logo/logo_oops_header-light.webp"
              width="100"
              height="100"
              alt="Oops Logo"
            />
            <p className="text-sm">
              {APP_CONFIG.name} — {t("tagline")}
            </p>
          </div>

          <div className="absolute bottom-10 flex w-full justify-between px-10">
            <div className="flex-1 space-y-1 text-foreground">
              <h2 className="font-medium">{t("fromIdea.title")}</h2>
              <p className="text-sm">{t("fromIdea.description")}</p>
            </div>

            <Separator orientation="vertical" className="mx-3 h-auto!" />

            <div className="flex-1 space-y-1 text-foreground">
              <h2 className="font-medium">{t("aiNative.title")}</h2>
              <p className="text-sm">{t("aiNative.description")}</p>
            </div>
          </div>
        </div>

        <div className="relative order-1 flex h-full">{children}</div>
      </div>
    </main>
  );
}
