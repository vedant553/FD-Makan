import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { createQuickActionEntry } from "@/server/modules/tasks/tasks.advanced.service";
import { quickActionSchema } from "@/server/modules/tasks/tasks.advanced.validators";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const payload = await parseDomainBody(quickActionSchema, req);
    const entry = await createQuickActionEntry(ctx, payload);
    return tasksOk({ entry }, { status: 201 });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
