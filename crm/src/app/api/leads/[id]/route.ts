import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { updateLead } from "@/lib/services/lead.service";
import { updateLeadSchema } from "@/lib/validators/lead";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getAuthContext();
    const { id } = await params;
    const parsed = updateLeadSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const lead = await updateLead(ctx, id, {
      ...parsed.data,
      email: parsed.data.email || null,
      campaignId: parsed.data.campaignId || null,
    });

    return ok({ lead });
  } catch (error) {
    return serverError(error);
  }
}
