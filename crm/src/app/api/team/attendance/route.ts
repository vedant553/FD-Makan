import { NextRequest } from "next/server";

import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { listAttendance, markAttendance } from "@/lib/services/team.service";
import { attendanceSchema } from "@/lib/validators/team";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok({ attendance: await listAttendance(ctx) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = attendanceSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    return ok({ record: await markAttendance(ctx, parsed.data) }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
