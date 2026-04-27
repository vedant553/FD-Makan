import { ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { getDashboardStats } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok(await getDashboardStats(ctx));
  } catch (error) {
    return serverError(error);
  }
}


