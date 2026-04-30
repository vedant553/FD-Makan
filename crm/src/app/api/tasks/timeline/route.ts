import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainQuery, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { getUnifiedTimeline } from "@/server/modules/tasks/tasks.advanced.service";
import { timelineQuerySchema } from "@/server/modules/tasks/tasks.advanced.validators";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const query = parseDomainQuery(timelineQuerySchema, {
      leadId: req.nextUrl.searchParams.get("leadId") ?? undefined,
      taskId: req.nextUrl.searchParams.get("taskId") ?? undefined,
      page: req.nextUrl.searchParams.get("page") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    });
    const result = await getUnifiedTimeline(ctx, query.leadId, query.taskId, query.page, query.limit);
    return tasksOk(result);
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
