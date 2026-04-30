import { ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { getTaskEngineCounters } from "@/lib/services/workflow.service";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    const counters = await getTaskEngineCounters(ctx);
    return ok({ counters });
  } catch (error) {
    return serverError(error);
  }
}
