import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-lg font-medium">{t("title")}</h1>
      <p className="text-muted-foreground text-sm">{t("description")}</p>
      <Link href="/" className="text-sm underline underline-offset-4">
        {t("returnHome")}
      </Link>
    </main>
  );
}
