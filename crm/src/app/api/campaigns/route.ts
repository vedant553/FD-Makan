import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { createCampaign, listCampaigns } from "@/lib/services/campaign.service";
import { campaignSchema } from "@/lib/validators/campaign";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok({ campaigns: await listCampaigns(ctx) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = campaignSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    return ok({ campaign: await createCampaign(ctx, parsed.data) }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
