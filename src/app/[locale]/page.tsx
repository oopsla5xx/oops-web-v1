import { SystemStatusView } from "@/features/system-status/SystemStatusView";
import { getHealth } from "@/services/health";
import { ApiError } from "@/lib/http";
import { CLIENT_ERROR_CODES, type ErrorCode } from "@/constants/error-codes";

// The whole point of this page is to show live backend status — a build-time
// static snapshot would defeat that, so force per-request rendering.
export const dynamic = "force-dynamic";

export default async function Page() {
  let health = null;
  let errorCode: ErrorCode | null = null;

  try {
    health = await getHealth(crypto.randomUUID());
  } catch (error) {
    errorCode =
      error instanceof ApiError ? (error.code as ErrorCode) : CLIENT_ERROR_CODES.UNKNOWN_ERROR;
    console.error("Initial health fetch failed", error);
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <SystemStatusView initialData={health} initialErrorCode={errorCode} />
    </main>
  );
}
