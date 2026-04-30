import { requireAuth } from "@/lib/auth/guards";
import type { AuthContext } from "@/lib/services/types";
import { ForbiddenError } from "@/server/core/errors";

export async function getAuthContext(): Promise<AuthContext> {
  const session = await requireAuth();

  return {
    userId: session.user.id,
    role: session.user.role,
    organizationId: session.user.organizationId,
  };
}

export function requireRole(role: string, allowedRoles: string[]) {
  if (!allowedRoles.includes(role)) {
    throw new ForbiddenError("Insufficient role permission");
  }
}

export function enforceOrgId(ctx: AuthContext, resourceOrgId?: string | null) {
  if (!resourceOrgId || resourceOrgId !== ctx.organizationId) {
    throw new ForbiddenError("Cross-organization access denied");
  }
}

export async function withAuth<T>(handler: (ctx: AuthContext) => Promise<T>) {
  const ctx = await getAuthContext();
  return handler(ctx);
}

export async function withRole<T>(allowedRoles: string[], handler: (ctx: AuthContext) => Promise<T>) {
  const ctx = await getAuthContext();
  requireRole(ctx.role, allowedRoles);
  return handler(ctx);
}
