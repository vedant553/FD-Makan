import { ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { getNotifications } from "@/lib/services/notification.service";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    const notifications = await getNotifications(ctx.organizationId, ctx.userId);
    return ok({ notifications });
  } catch (error) {
    return serverError(error);
  }
}


