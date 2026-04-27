import { requireAuth } from "@/lib/auth/guards";
import type { AuthContext } from "@/lib/services/types";

export async function getAuthContext(): Promise<AuthContext> {
  const session = await requireAuth();

  return {
    userId: session.user.id,
    role: session.user.role,
    organizationId: session.user.organizationId,
  };
}

