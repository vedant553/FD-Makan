import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session;
}

export function ensureRole(role: string, acceptedRoles: string[]) {
  return acceptedRoles.includes(role);
}

export function canAccessUserData(current: { id: string; role: string }, targetUserId?: string | null) {
  if (current.role === "ADMIN" || current.role === "MANAGER") return true;
  if (!targetUserId) return true;
  return current.id === targetUserId;
}

