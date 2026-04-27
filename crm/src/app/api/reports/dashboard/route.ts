import { ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { getAdvancedDashboardReport } from "@/lib/services/report.service";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    return ok(await getAdvancedDashboardReport(ctx));
  } catch (error) {
    return serverError(error);
  }
}
