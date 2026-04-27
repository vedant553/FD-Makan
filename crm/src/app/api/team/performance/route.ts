import { ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { getTeamPerformance } from "@/lib/services/team.service";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok({ members: await getTeamPerformance(ctx) });
  } catch (error) {
    return serverError(error);
  }
}
