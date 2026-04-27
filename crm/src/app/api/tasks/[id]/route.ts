import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { deleteTask, updateTask } from "@/lib/services/task.service";
import { updateTaskSchema } from "@/lib/validators/task";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getAuthContext();
    const { id } = await params;
    const parsed = updateTaskSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const task = await updateTask(ctx, id, parsed.data);
    return ok({ task });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getAuthContext();
    const { id } = await params;
    return ok(await deleteTask(ctx, id));
  } catch (error) {
    return serverError(error);
  }
}
