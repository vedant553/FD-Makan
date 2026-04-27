import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { sendBulkMessages } from "@/lib/services/message.service";
import { bulkMessageSchema } from "@/lib/validators/message";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = bulkMessageSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const messages = await sendBulkMessages(ctx, parsed.data);
    return ok({ messages }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
