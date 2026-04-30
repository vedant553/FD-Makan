import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { bulkAssignTasks } from "@/server/modules/tasks/tasks.advanced.service";
import { bulkAssignSchema } from "@/server/modules/tasks/tasks.advanced.validators";

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const payload = await parseDomainBody(bulkAssignSchema, req);
    const result = await bulkAssignTasks(ctx, payload);
    return tasksOk(result);
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
