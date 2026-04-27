import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { matchPropertiesForLead } from "@/lib/services/property.service";
import { propertyMatchSchema } from "@/lib/validators/property";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = propertyMatchSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    return ok({ matches: await matchPropertiesForLead(ctx, parsed.data.leadId) });
  } catch (error) {
    return serverError(error);
  }
}
