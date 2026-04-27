import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { getCallStats, listCalls, logCall } from "@/lib/services/call.service";
import { callSchema } from "@/lib/validators/call";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok({ calls: await listCalls(ctx) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = callSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const call = await logCall(ctx, parsed.data);
    const stats = await getCallStats(ctx);
    return ok({ call, stats }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
