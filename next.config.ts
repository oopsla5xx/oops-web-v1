import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  // Next's file tracer misses @swc/helpers' ESM entry points under pnpm's
  // symlinked store, breaking the standalone output at runtime. Force it in.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/@swc/helpers/**/*"],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
