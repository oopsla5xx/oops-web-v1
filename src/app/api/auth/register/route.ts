import { NextResponse } from "next/server";
import { registerUser } from "@/services/auth";
import { ApiError } from "@/lib/http";
import { CLIENT_ERROR_CODES, type ErrorCode } from "@/constants/error-codes";
import { HEADER_REQUEST_ID } from "@/constants/api";
import type { RegisterRequest } from "@/types/user";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const headers = { [HEADER_REQUEST_ID]: requestId };

  const body = (await request.json().catch(() => null)) as RegisterRequest | null;

  try {
    const user = await registerUser(body as RegisterRequest, requestId);
    return NextResponse.json(user, { status: 201, headers });
  } catch (error) {
    const code: ErrorCode =
      error instanceof ApiError ? (error.code as ErrorCode) : CLIENT_ERROR_CODES.UNKNOWN_ERROR;
    const status = error instanceof ApiError && error.status ? error.status : 502;
    const field = error instanceof ApiError ? error.field : undefined;

    return NextResponse.json({ error: { code, ...(field ? { field } : {}) } }, { status, headers });
  }
}
