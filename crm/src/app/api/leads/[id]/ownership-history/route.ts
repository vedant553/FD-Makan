import { ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { listLeadOwnershipHistory } from "@/lib/services/workflow.service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getAuthContext();
    const { id } = await params;
    const history = await listLeadOwnershipHistory(ctx, id);
    return ok({ history });
  } catch (error) {
    return serverError(error);
  }
}
