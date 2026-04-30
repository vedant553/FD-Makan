import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { createEntityNote, listEntityNotes } from "@/lib/services/workflow.service";
import { createNoteSchema, timelineQuerySchema } from "@/lib/validators/workflow";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = timelineQuerySchema.safeParse({
      entityType: req.nextUrl.searchParams.get("entityType"),
      entityId: req.nextUrl.searchParams.get("entityId"),
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    const notes = await listEntityNotes(ctx, parsed.data);
    return ok({ notes });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = createNoteSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    const note = await createEntityNote(ctx, parsed.data);
    return ok({ note }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
