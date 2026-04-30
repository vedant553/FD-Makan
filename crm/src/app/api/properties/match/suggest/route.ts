import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { suggestPropertyMatches } from "@/lib/services/workflow.service";
import { propertyMatchSchema } from "@/lib/validators/property";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = propertyMatchSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    const suggestions = await suggestPropertyMatches(ctx, parsed.data.leadId);
    return ok({ suggestions });
  } catch (error) {
    return serverError(error);
  }
}
