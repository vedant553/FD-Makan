import { ok, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/server/core/auth";

const STAGES = [
  "NEW LEAD",
  "OPEN",
  "FOLLOW UP",
  "CALL BACK",
  "PROSPECT",
  "WORKABLE",
  "ALREADY TAGGED",
  "BOOKED",
] as const;

export async function GET() {
  try {
    const ctx = await getAuthContext();
    const where = {
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    };

    const leads = await prisma.lead.findMany({
      where,
      select: {
        stageLabel: true,
        lastActivity: true,
        returningCount: true,
        pendingTaskCount: true,
      },
    });

    const stageCounts = STAGES.reduce<Record<string, number>>((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {});

    for (const lead of leads) {
      const stage = (lead.stageLabel ?? "").toUpperCase().trim();
      if (stageCounts[stage] !== undefined) stageCounts[stage] += 1;
    }

    const summary = {
      untouched: leads.filter((lead) => (lead.stageLabel ?? "").toUpperCase().trim() === "NEW LEAD").length,
      noFollowups: leads.filter((lead) => !lead.lastActivity || String(lead.lastActivity).trim() === "").length,
      returning: leads.filter((lead) => (lead.returningCount ?? 0) > 0).length,
      returningNoFollowup: leads.filter(
        (lead) => (lead.returningCount ?? 0) > 0 && (!lead.lastActivity || String(lead.lastActivity).trim() === ""),
      ).length,
      overdueTasks: leads.filter((lead) => (lead.pendingTaskCount ?? 0) > 0).length,
    };

    return ok({
      total: leads.length,
      stageCounts,
      summary,
    });
  } catch (error) {
    return serverError(error);
  }
}
