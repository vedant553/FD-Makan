import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { transferLeads } from "@/lib/services/workflow.service";
import { leadTransferSchema } from "@/lib/validators/workflow";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = leadTransferSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const result = await transferLeads(ctx, parsed.data);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
