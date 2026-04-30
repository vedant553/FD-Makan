import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { completeTask } from "@/server/modules/tasks/tasks.service";

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    const task = await completeTask(ctx, id);
    return tasksOk({ task });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
