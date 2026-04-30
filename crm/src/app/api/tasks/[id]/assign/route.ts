import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { assignTask } from "@/server/modules/tasks/tasks.service";
import { assignTaskSchema } from "@/server/modules/tasks/tasks.validators";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    const payload = await parseDomainBody(assignTaskSchema, req);
    const task = await assignTask(ctx, id, payload.assignedToId);
    return tasksOk({ task });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
