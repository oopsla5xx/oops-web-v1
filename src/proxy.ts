import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes (our BFF) and Next.js internals — only page routes get locale handling.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
