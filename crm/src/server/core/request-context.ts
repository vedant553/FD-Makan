import { headers } from "next/headers";

import { logger } from "@/server/core/logger";

export async function getRequestId() {
  const h = await headers();
  return h.get("x-request-id") ?? crypto.randomUUID();
}

export function logRequestStart(requestId: string, method: string, path: string) {
  logger.info("REQUEST_START", { requestId, method, path });
}

export function logRequestEnd(requestId: string, method: string, path: string, status: number) {
  logger.info("REQUEST_END", { requestId, method, path, status });
}
