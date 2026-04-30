import { NextRequest } from "next/server";

import { apiError, apiOk } from "@/server/core/api-response";
import { getAuthContext } from "@/server/core/auth";
import { logger } from "@/server/core/logger";
import { getRequestId, logRequestEnd, logRequestStart } from "@/server/core/request-context";
import { parseBody } from "@/server/core/validation";
import { updateLead } from "@/server/modules/leads/leads.service";
import { updateLeadSchema } from "@/server/modules/leads/leads.validators";
import "@/server/modules/leads/leads.docs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = await getRequestId();
  logRequestStart(requestId, req.method, req.nextUrl.pathname);
  try {
    const ctx = await getAuthContext();
    const { id } = await params;
    const payload = await parseBody(updateLeadSchema, req);
    const lead = await updateLead(ctx, id, payload);
    const response = apiOk({ lead }, { requestId });
    logRequestEnd(requestId, req.method, req.nextUrl.pathname, response.status);
    return response;
  } catch (error) {
    logger.error("UPDATE_LEAD_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "unknown error",
    });
    const response = apiError(error, requestId);
    logRequestEnd(requestId, req.method, req.nextUrl.pathname, response.status);
    return response;
  }
}
