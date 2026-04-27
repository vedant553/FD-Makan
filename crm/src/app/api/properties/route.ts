import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { createProperty, listProperties } from "@/lib/services/property.service";
import { propertySchema } from "@/lib/validators/property";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok({ properties: await listProperties(ctx) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = propertySchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    return ok({ property: await createProperty(ctx, parsed.data) }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
