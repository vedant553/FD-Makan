import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { sendMessage } from "@/lib/services/message.service";
import { sendMessageSchema } from "@/lib/validators/message";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = sendMessageSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    return ok({ message: await sendMessage(ctx, parsed.data) }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
