import { NextRequest } from "next/server";

import { apiError, apiOk } from "@/server/core/api-response";
import { getAuthContext } from "@/server/core/auth";
import { parseBody, parseQuery } from "@/server/core/validation";
import { logger } from "@/server/core/logger";
import { getRequestId, logRequestEnd, logRequestStart } from "@/server/core/request-context";
import { createLead, listLeads } from "@/server/modules/leads/leads.service";
import { createLeadSchema, leadsListQuerySchema } from "@/server/modules/leads/leads.validators";
import "@/server/modules/leads/leads.docs";

export async function GET(req: NextRequest) {
  const requestId = await getRequestId();
  logRequestStart(requestId, req.method, req.nextUrl.pathname);
  try {
    const ctx = await getAuthContext();
    const query = parseQuery(leadsListQuerySchema, {
      page: req.nextUrl.searchParams.get("page") ?? undefined,
      pageSize: req.nextUrl.searchParams.get("pageSize") ?? undefined,
      search: req.nextUrl.searchParams.get("search") ?? undefined,
      sortBy: req.nextUrl.searchParams.get("sortBy") ?? undefined,
      sortOrder: req.nextUrl.searchParams.get("sortOrder") ?? undefined,
      status: req.nextUrl.searchParams.get("status") ?? undefined,
      assignedToId: req.nextUrl.searchParams.get("assignedToId") ?? undefined,
      source: req.nextUrl.searchParams.get("source") ?? undefined,
    });
    const result = await listLeads(ctx, query);
    const response = apiOk(
      { leads: result.items },
      { meta: { pagination: result.pagination }, requestId },
    );
    logRequestEnd(requestId, req.method, req.nextUrl.pathname, response.status);
    return response;
  } catch (error) {
    logger.error("LIST_LEADS_FAILED", { requestId, error: error instanceof Error ? error.message : "unknown error" });
    const response = apiError(error, requestId);
    logRequestEnd(requestId, req.method, req.nextUrl.pathname, response.status);
    return response;
  }
}

export async function POST(req: NextRequest) {
  const requestId = await getRequestId();
  logRequestStart(requestId, req.method, req.nextUrl.pathname);
  try {
    const ctx = await getAuthContext();
    const payload = await parseBody(createLeadSchema, req);
    const lead = await createLead(ctx, payload);
    const response = apiOk({ lead }, { status: 201, requestId });
    logRequestEnd(requestId, req.method, req.nextUrl.pathname, response.status);
    return response;
  } catch (error) {
    logger.error("CREATE_LEAD_FAILED", { requestId, error: error instanceof Error ? error.message : "unknown error" });
    const response = apiError(error, requestId);
    logRequestEnd(requestId, req.method, req.nextUrl.pathname, response.status);
    return response;
  }
}
