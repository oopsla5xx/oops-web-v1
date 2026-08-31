import { NextResponse } from "next/server";
import { getHealth } from "@/services/health";
import { ApiError } from "@/lib/http";
import { CLIENT_ERROR_CODES, type ErrorCode } from "@/constants/error-codes";
import { HEADER_REQUEST_ID } from "@/constants/api";

export async function GET() {
  const requestId = crypto.randomUUID();

  try {
    const health = await getHealth(requestId);
    return NextResponse.json(health, { status: 200, headers: { [HEADER_REQUEST_ID]: requestId } });
  } catch (error) {
    const code: ErrorCode =
      error instanceof ApiError ? (error.code as ErrorCode) : CLIENT_ERROR_CODES.UNKNOWN_ERROR;
    const status = error instanceof ApiError && error.status ? error.status : 502;

    console.error("GET /api/health failed", { requestId, error });

    return NextResponse.json(
      { error: { code } },
      { status, headers: { [HEADER_REQUEST_ID]: requestId } },
    );
  }
}
