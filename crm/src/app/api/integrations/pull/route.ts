import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { pullIntegrationLeads } from "@/lib/services/integration.service";
import { integrationPullSchema } from "@/lib/validators/automation";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = integrationPullSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    return ok({ lead: await pullIntegrationLeads(ctx, parsed.data.provider, parsed.data.payload) }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
