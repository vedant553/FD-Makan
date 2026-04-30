import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { transitionPropertyStatus } from "@/lib/services/workflow.service";
import { propertyStatusTransitionSchema } from "@/lib/validators/workflow";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getAuthContext();
    const parsed = propertyStatusTransitionSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    const { id } = await params;
    const property = await transitionPropertyStatus(ctx, id, parsed.data);
    return ok({ property });
  } catch (error) {
    return serverError(error);
  }
}
