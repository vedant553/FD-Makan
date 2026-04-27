import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { createDeal, listDeals } from "@/lib/services/deal.service";
import { dealSchema } from "@/lib/validators/deal";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok({ deals: await listDeals(ctx) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = dealSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    return ok({ deal: await createDeal(ctx, parsed.data) }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
