import { NextRequest } from "next/server";

import { forbidden, ok, serverError } from "@/lib/api-response";
import { markOverdueTasks, triggerTaskReminders } from "@/lib/services/task.service";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("x-cron-secret");
    if (!auth || auth !== process.env.CRON_SECRET) {
      return forbidden("Invalid cron secret");
    }
    const [overdueUpdated, remindersTriggered] = await Promise.all([
      markOverdueTasks(),
      triggerTaskReminders(),
    ]);

    return ok({ overdueUpdated, remindersTriggered });
  } catch (error) {
    return serverError(error);
  }
}
