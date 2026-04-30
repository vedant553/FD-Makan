import { NextResponse } from "next/server";

import { AppError, toAppError } from "@/server/core/errors";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
};

export function apiOk<T>(data: T, init?: ResponseInit & { meta?: Record<string, unknown>; requestId?: string }) {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(init?.meta ? { meta: init.meta } : {}),
    ...(init?.requestId ? { requestId: init.requestId } : {}),
  };
  return NextResponse.json(body, { status: init?.status, headers: init?.headers });
}

export function apiError(error: unknown, requestId?: string) {
  const appError = toAppError(error);
  const body: ApiFailure = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    },
    ...(requestId ? { requestId } : {}),
  };

  return NextResponse.json(body, { status: appError.status });
}

export function withErrorMapping(handler: () => Promise<Response>, requestId?: string) {
  return handler().catch((error) => apiError(error, requestId));
}

export function assertOrThrow(condition: unknown, error: AppError): asserts condition {
  if (!condition) throw error;
}
