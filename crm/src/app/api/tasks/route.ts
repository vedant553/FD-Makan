import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { createTask, listTasks } from "@/lib/services/task.service";
import { createTaskSchema, taskFilterSchema } from "@/lib/validators/task";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext();

    const parsed = taskFilterSchema.safeParse({
      view: req.nextUrl.searchParams.get("view") ?? undefined,
      priority: req.nextUrl.searchParams.get("priority") ?? undefined,
      assignedToId: req.nextUrl.searchParams.get("assignedToId") ?? undefined,
      search: req.nextUrl.searchParams.get("search") ?? undefined,
      date: req.nextUrl.searchParams.get("date") ?? undefined,
    });

    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const tasks = await listTasks(ctx, parsed.data);
    return ok({ tasks });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = createTaskSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const task = await createTask(ctx, parsed.data);
    return ok({ task }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}


