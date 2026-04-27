import { ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { listOrganizationUsers } from "@/lib/services/user.service";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    const users = await listOrganizationUsers(ctx.organizationId);
    return ok({ users });
  } catch (error) {
    return serverError(error);
  }
}


