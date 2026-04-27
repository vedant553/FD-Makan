import { prisma } from "@/lib/db";
import type { AuthContext } from "@/lib/services/types";

export async function getAdvancedDashboardReport(ctx: AuthContext) {
  const baseLeadWhere = {
    organizationId: ctx.organizationId,
    ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
  };
  const baseTaskWhere = {
    organizationId: ctx.organizationId,
    ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
  };

  const [totalLeads, closedLeads, totalTasks, completedTasks, totalCalls, connectedCalls, wonDeals, payments] = await Promise.all([
    prisma.lead.count({ where: baseLeadWhere }),
    prisma.lead.count({ where: { ...baseLeadWhere, status: "CLOSED" } }),
    prisma.task.count({ where: baseTaskWhere }),
    prisma.task.count({ where: { ...baseTaskWhere, status: "COMPLETED" } }),
    prisma.callLog.count({ where: { organizationId: ctx.organizationId, ...(ctx.role === "AGENT" ? { userId: ctx.userId } : {}) } }),
    prisma.callLog.count({ where: { organizationId: ctx.organizationId, status: "CONNECTED", ...(ctx.role === "AGENT" ? { userId: ctx.userId } : {}) } }),
    prisma.deal.aggregate({ where: { organizationId: ctx.organizationId, status: { in: ["WON", "CLOSED"] } }, _sum: { value: true } }),
    prisma.payment.aggregate({ where: { organizationId: ctx.organizationId, status: "RECEIVED" }, _sum: { amount: true } }),
  ]);

  return {
    leadConversionRate: totalLeads === 0 ? 0 : Number(((closedLeads / totalLeads) * 100).toFixed(2)),
    taskCompletionRate: totalTasks === 0 ? 0 : Number(((completedTasks / totalTasks) * 100).toFixed(2)),
    callsPerformance: {
      totalCalls,
      successfulCalls: connectedCalls,
      successRate: totalCalls === 0 ? 0 : Number(((connectedCalls / totalCalls) * 100).toFixed(2)),
    },
    salesPerformance: {
      dealValue: wonDeals._sum.value ?? 0,
      paymentsReceived: payments._sum.amount ?? 0,
    },
  };
}

export async function getSalesReport(ctx: AuthContext) {
  const [deals, payments, campaigns] = await Promise.all([
    prisma.deal.findMany({
      where: { organizationId: ctx.organizationId },
      include: { lead: { select: { name: true } }, property: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { organizationId: ctx.organizationId },
      include: { deal: { select: { id: true, value: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.campaign.findMany({ where: { organizationId: ctx.organizationId }, orderBy: { createdAt: "desc" } }),
  ]);

  return { deals, payments, campaigns };
}
