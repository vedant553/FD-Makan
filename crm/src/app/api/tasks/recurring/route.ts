import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { TasksDomainError, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { createFollowupSequence, createRecurringTasks } from "@/server/modules/tasks/tasks.advanced.service";
import { followupSequenceSchema, recurringTaskSchema } from "@/server/modules/tasks/tasks.advanced.validators";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const body = await req.json();

    if (body.mode === "sequence") {
      const parsed = followupSequenceSchema.safeParse(body);
      if (!parsed.success) {
        throw new TasksDomainError(parsed.error.issues.map((issue) => issue.message).join(", "), "BAD_REQUEST", 400);
      }
      const payload = parsed.data;
      const result = await createFollowupSequence(ctx, payload);
      return tasksOk(result, { status: 201 });
    }

    const parsed = recurringTaskSchema.safeParse(body);
    if (!parsed.success) {
      throw new TasksDomainError(parsed.error.issues.map((issue) => issue.message).join(", "), "BAD_REQUEST", 400);
    }
    const payload = parsed.data;
    const result = await createRecurringTasks(ctx, payload);
    return tasksOk(result, { status: 201 });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
