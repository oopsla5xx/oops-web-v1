import { getTranslations } from "next-intl/server";

import { Globe } from "lucide-react";

import { APP_CONFIG } from "@/constants/app-config";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "../../_components/register-form";

export default async function RegisterPage() {
  const t = await getTranslations("register");
  const tCommon = await getTranslations("common");

  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-80">
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-2xl">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
        <RegisterForm />
      </div>

      <div className="absolute top-5 flex w-full justify-end px-10">
        <div className="text-muted-foreground text-sm">
          {t("alreadyHaveAccount")}{" "}
          <Link prefetch={false} className="text-foreground" href="/auth/v1/login">
            {t("login")}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
        <div className="flex items-center gap-1 text-sm">
          <Globe className="size-4 text-muted-foreground" />
          {tCommon("language")}
        </div>
      </div>
    </>
  );
}
