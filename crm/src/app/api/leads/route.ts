import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { createLead, listLeads } from "@/lib/services/lead.service";
import { createLeadSchema } from "@/lib/validators/lead";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok({ leads: await listLeads(ctx) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = createLeadSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const lead = await createLead(ctx, {
      ...parsed.data,
      email: parsed.data.email || null,
      campaignId: parsed.data.campaignId || null,
    });

    return ok({ lead }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
