import { canAccessUserData, requireAuth } from "@/lib/auth/guards";
import type { AuthContext } from "@/lib/services/types";
import { getTaskActionPermissions } from "@/lib/rbac/tasks";
import { TasksDomainError } from "@/server/modules/tasks/tasks.domain";

export async function getTasksAuthContext(): Promise<AuthContext> {
  const session = await requireAuth();

  return {
    userId: session.user.id,
    role: session.user.role,
    organizationId: session.user.organizationId,
  };
}

export function assertTaskAssigneeAccess(ctx: AuthContext, assignedToId?: string | null) {
  if (!canAccessUserData({ id: ctx.userId, role: ctx.role }, assignedToId)) {
    throw new TasksDomainError("Forbidden", "FORBIDDEN", 403);
  }
}

export function assertTaskAction(
  ctx: AuthContext,
  action: "create" | "update" | "delete" | "assign" | "reassign" | "complete" | "export",
) {
  const permissions = getTaskActionPermissions(ctx.role);
  if (!permissions[action]) {
    throw new TasksDomainError("Forbidden", "FORBIDDEN", 403);
  }
}
