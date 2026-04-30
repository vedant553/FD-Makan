import type { AuthContext } from "@/lib/services/types";

type LogLevel = "info" | "warn" | "error";

type TaskLifecycleEvent =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_COMPLETED"
  | "TASK_DELETED"
  | "TASK_ASSIGNED"
  | "SITE_VISIT_CREATED";

export function logTaskEvent(
  level: LogLevel,
  event: TaskLifecycleEvent,
  ctx: AuthContext,
  details: Record<string, unknown> = {},
) {
  const entry = {
    domain: "tasks",
    event,
    level,
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    role: ctx.role,
    ts: new Date().toISOString(),
    ...details,
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(entry));
    return;
  }

  console.info(JSON.stringify(entry));
}
