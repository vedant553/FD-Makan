import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainQuery, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { getAssignmentSuggestions } from "@/server/modules/tasks/tasks.advanced.service";
import { assignmentSuggestionQuerySchema } from "@/server/modules/tasks/tasks.advanced.validators";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const query = parseDomainQuery(assignmentSuggestionQuerySchema, {
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
      leadId: req.nextUrl.searchParams.get("leadId") ?? undefined,
    });
    const suggestions = await getAssignmentSuggestions(ctx, query.limit);
    return tasksOk({ suggestions });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
