import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { runReminderEngine } from "@/server/modules/tasks/tasks.advanced.service";
import { reminderRunSchema } from "@/server/modules/tasks/tasks.advanced.validators";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const payload = await parseDomainBody(reminderRunSchema, req);
    const result = await runReminderEngine(ctx, payload.preDueWindowMinutes);
    return tasksOk(result);
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
