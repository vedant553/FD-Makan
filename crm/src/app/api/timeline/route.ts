import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { getUnifiedTimeline } from "@/lib/services/workflow.service";
import { timelineQuerySchema } from "@/lib/validators/workflow";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = timelineQuerySchema.safeParse({
      entityType: req.nextUrl.searchParams.get("entityType"),
      entityId: req.nextUrl.searchParams.get("entityId"),
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    const timeline = await getUnifiedTimeline(ctx, parsed.data);
    return ok({ timeline });
  } catch (error) {
    return serverError(error);
  }
}
