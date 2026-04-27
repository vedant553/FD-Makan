import { ActivityType, CallStatus, TaskPriority, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createActivity } from "@/lib/services/activity.service";
import type { AuthContext } from "@/lib/services/types";

type LogCallInput = {
  phone: string;
  leadId?: string;
  status: CallStatus;
  duration: number;
  notes?: string;
};

async function resolveLead(ctx: AuthContext, input: LogCallInput) {
  if (input.leadId) {
    const lead = await prisma.lead.findFirst({ where: { id: input.leadId, organizationId: ctx.organizationId } });
    if (!lead) throw new Error("Lead not found");
    return lead;
  }

  const byPhone = await prisma.lead.findFirst({
    where: { phone: input.phone, organizationId: ctx.organizationId },
  });

  if (byPhone) return byPhone;

  return prisma.lead.create({
    data: {
      name: `Unknown ${input.phone}`,
      phone: input.phone,
      source: "Calling",
      status: "NEW",
      assignedToId: ctx.userId,
      organizationId: ctx.organizationId,
    },
  });
}

export async function logCall(ctx: AuthContext, input: LogCallInput) {
  const lead = await resolveLead(ctx, input);

  const call = await prisma.callLog.create({
    data: {
      phone: input.phone,
      leadId: lead.id,
      userId: ctx.userId,
      status: input.status,
      duration: Math.max(0, input.duration),
      notes: input.notes,
      organizationId: ctx.organizationId,
    },
    include: { lead: true, user: { select: { id: true, name: true } } },
  });

  if (input.status !== CallStatus.CONNECTED) {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 4);

    await prisma.task.create({
      data: {
        title: `Call back ${lead.name}`,
        description: `Auto follow-up after ${input.status.toLowerCase()} call`,
        leadId: lead.id,
        assignedToId: lead.assignedToId ?? ctx.userId,
        createdById: ctx.userId,
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        dueDate,
        reminderTime: new Date(dueDate.getTime() - 30 * 60 * 1000),
        organizationId: ctx.organizationId,
      },
    });
  }

  await createActivity({
    type: ActivityType.CALL_LOGGED,
    message: `Call ${call.status.toLowerCase()} (${call.duration}s) with ${lead.phone}`,
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    leadId: lead.id,
  });

  return call;
}

export async function listCalls(ctx: AuthContext) {
  return prisma.callLog.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { userId: ctx.userId } : {}),
    },
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCallStats(ctx: AuthContext) {
  const where = {
    organizationId: ctx.organizationId,
    ...(ctx.role === "AGENT" ? { userId: ctx.userId } : {}),
  };

  const [totalCalls, successfulCalls, connectedByLead] = await Promise.all([
    prisma.callLog.count({ where }),
    prisma.callLog.count({ where: { ...where, status: CallStatus.CONNECTED } }),
    prisma.callLog.groupBy({
      by: ["userId"],
      where,
      _count: { _all: true },
      _sum: { duration: true },
    }),
  ]);

  const leadConversions = await prisma.lead.count({
    where: {
      organizationId: ctx.organizationId,
      status: "CLOSED",
      ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    },
  });

  return {
    totalCalls,
    successfulCalls,
    conversionRate: totalCalls === 0 ? 0 : Number(((leadConversions / totalCalls) * 100).toFixed(2)),
    telecallerPerformance: connectedByLead,
  };
}
