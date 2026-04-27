import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { createSiteVisit, listSiteVisits } from "@/lib/services/site-visit.service";
import { siteVisitSchema } from "@/lib/validators/site-visit";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok({ siteVisits: await listSiteVisits(ctx) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = siteVisitSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    return ok({ siteVisit: await createSiteVisit(ctx, parsed.data) }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
