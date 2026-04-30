import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, parseDomainQuery, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { createSiteVisit, listSiteVisits } from "@/server/modules/tasks/site-visits.service";
import { createSiteVisitSchema, siteVisitFilterSchema } from "@/server/modules/tasks/site-visits.validators";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const filters = parseDomainQuery(siteVisitFilterSchema, {
      page: req.nextUrl.searchParams.get("page") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
      search: req.nextUrl.searchParams.get("search") ?? undefined,
      status: req.nextUrl.searchParams.get("status") ?? undefined,
      assignedToId: req.nextUrl.searchParams.get("assignedToId") ?? undefined,
      leadId: req.nextUrl.searchParams.get("leadId") ?? undefined,
      propertyId: req.nextUrl.searchParams.get("propertyId") ?? undefined,
      dateFrom: req.nextUrl.searchParams.get("dateFrom") ?? undefined,
      dateTo: req.nextUrl.searchParams.get("dateTo") ?? undefined,
      sortBy: req.nextUrl.searchParams.get("sortBy") ?? undefined,
      sortOrder: req.nextUrl.searchParams.get("sortOrder") ?? undefined,
    });
    const result = await listSiteVisits(ctx, filters);
    return tasksOk({ siteVisits: result.items, pagination: result.pagination });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const payload = await parseDomainBody(createSiteVisitSchema, req);
    return tasksOk({ siteVisit: await createSiteVisit(ctx, payload) }, { status: 201 });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
