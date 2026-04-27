import { ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { getCallStats } from "@/lib/services/call.service";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok(await getCallStats(ctx));
  } catch (error) {
    return serverError(error);
  }
}
