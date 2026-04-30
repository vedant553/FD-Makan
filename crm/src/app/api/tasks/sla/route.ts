import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainQuery, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { getSlaIndicators } from "@/server/modules/tasks/tasks.advanced.service";
import { slaQuerySchema } from "@/server/modules/tasks/tasks.advanced.validators";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const query = parseDomainQuery(slaQuerySchema, {
      dateFrom: req.nextUrl.searchParams.get("dateFrom") ?? undefined,
      dateTo: req.nextUrl.searchParams.get("dateTo") ?? undefined,
      assigneeId: req.nextUrl.searchParams.get("assigneeId") ?? undefined,
    });
    const metrics = await getSlaIndicators(ctx, query.dateFrom, query.dateTo, query.assigneeId);
    return tasksOk({ metrics });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
