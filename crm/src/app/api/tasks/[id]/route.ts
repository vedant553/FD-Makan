import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { deleteTask, getTaskById, updateTask } from "@/server/modules/tasks/tasks.service";
import { updateTaskSchema } from "@/server/modules/tasks/tasks.validators";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    const task = await getTaskById(ctx, id);
    return tasksOk({ task });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    const payload = await parseDomainBody(updateTaskSchema, req);
    const task = await updateTask(ctx, id, payload);
    return tasksOk({ task });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}

export const PUT = PATCH;

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    return tasksOk(await deleteTask(ctx, id));
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
