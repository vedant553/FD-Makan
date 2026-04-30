import { ActivityType, DealStatus, NotificationType, Prisma, PropertyStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createActivity } from "@/lib/services/activity.service";
import { createNotification } from "@/lib/services/notification.service";
import type { AuthContext } from "@/lib/services/types";

function assertManagerOrAdmin(ctx: AuthContext) {
  if (ctx.role === "AGENT") {
    throw new Error("Forbidden");
  }
}

async function logWorkflowEvent(ctx: AuthContext, eventType: string, payload: Prisma.InputJsonValue) {
  await prisma.integrationEvent.create({
    data: {
      provider: "CRM_WORKFLOW",
      eventType,
      payload,
      status: "RECORDED",
      organizationId: ctx.organizationId,
    },
  });
}

export async function transferLeads(
  ctx: AuthContext,
  input: { leadIds: string[]; toUserId: string; reason: string },
) {
  assertManagerOrAdmin(ctx);
  const assignee = await prisma.user.findFirst({
    where: { id: input.toUserId, organizationId: ctx.organizationId },
  });
  if (!assignee) throw new Error("Assigned user not found");

  const leads = await prisma.lead.findMany({
    where: { id: { in: input.leadIds }, organizationId: ctx.organizationId },
  });
  if (!leads.length) return { updated: 0 };

  const leadMap = new Map(leads.map((lead) => [lead.id, lead]));
  const events: Prisma.PrismaPromise<unknown>[] = [];
  for (const leadId of input.leadIds) {
    const lead = leadMap.get(leadId);
    if (!lead) continue;

    events.push(
      prisma.lead.update({
        where: { id: lead.id },
        data: { assignedToId: input.toUserId },
      }),
    );

    events.push(
      prisma.integrationEvent.create({
        data: {
          provider: "CRM_WORKFLOW",
          eventType: "LEAD_TRANSFER",
          payload: {
            entityType: "lead",
            entityId: lead.id,
            fromUserId: lead.assignedToId,
            toUserId: input.toUserId,
            reason: input.reason,
            transferredBy: ctx.userId,
            transferredAt: new Date().toISOString(),
          },
          status: "RECORDED",
          organizationId: ctx.organizationId,
        },
      }),
    );
  }
  await prisma.$transaction(events);

  await createNotification({
    title: "Lead Transfer",
    body: `${leads.length} lead(s) assigned to you`,
    organizationId: ctx.organizationId,
    recipientId: input.toUserId,
    type: NotificationType.GENERAL,
  });

  await createActivity({
    type: ActivityType.LEAD_UPDATED,
    message: `Transferred ${leads.length} lead(s) to ${assignee.name}`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
  });

  return { updated: leads.length };
}

export async function listLeadOwnershipHistory(ctx: AuthContext, leadId: string) {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, organizationId: ctx.organizationId } });
  if (!lead) throw new Error("Lead not found");

  const records = await prisma.integrationEvent.findMany({
    where: {
      organizationId: ctx.organizationId,
      provider: "CRM_WORKFLOW",
      eventType: "LEAD_TRANSFER",
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return records.filter((record) => {
    const payload = record.payload as { entityType?: string; entityId?: string };
    return payload.entityType === "lead" && payload.entityId === leadId;
  });
}

export async function updateDealWorkflow(
  ctx: AuthContext,
  dealId: string,
  input: { stage: "OPEN" | "WON" | "LOST" | "CLOSED"; approvalStatus: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"; remark?: string },
) {
  assertManagerOrAdmin(ctx);
  const deal = await prisma.deal.findFirst({ where: { id: dealId, organizationId: ctx.organizationId } });
  if (!deal) throw new Error("Deal not found");

  const updated = await prisma.deal.update({
    where: { id: deal.id },
    data: {
      status: input.stage as DealStatus,
      ...(input.stage === "CLOSED" ? { closedAt: new Date() } : {}),
    },
  });

  await logWorkflowEvent(ctx, "DEAL_STAGE_TRANSITION", {
    entityType: "deal",
    entityId: deal.id,
    fromStage: deal.status,
    toStage: input.stage,
    approvalStatus: input.approvalStatus,
    remark: input.remark ?? null,
    changedBy: ctx.userId,
    changedAt: new Date().toISOString(),
  });

  await createActivity({
    type: ActivityType.DEAL_CREATED,
    message: `Deal ${deal.id} moved from ${deal.status} to ${input.stage} (${input.approvalStatus})`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    leadId: deal.leadId,
  });

  return updated;
}

export async function createEntityNote(
  ctx: AuthContext,
  input: { entityType: "lead" | "contact" | "property" | "deal"; entityId: string; body: string; mentions: string[] },
) {
  if (input.entityType === "lead") {
    const lead = await prisma.lead.findFirst({ where: { id: input.entityId, organizationId: ctx.organizationId } });
    if (!lead) throw new Error("Lead not found");
  }
  if (input.entityType === "property") {
    const property = await prisma.property.findFirst({ where: { id: input.entityId, organizationId: ctx.organizationId } });
    if (!property) throw new Error("Property not found");
  }
  if (input.entityType === "deal") {
    const deal = await prisma.deal.findFirst({ where: { id: input.entityId, organizationId: ctx.organizationId } });
    if (!deal) throw new Error("Deal not found");
  }

  const note = await prisma.integrationEvent.create({
    data: {
      provider: "CRM_NOTE",
      eventType: "NOTE_ADDED",
      payload: {
        entityType: input.entityType,
        entityId: input.entityId,
        body: input.body,
        mentions: input.mentions,
        createdBy: ctx.userId,
        createdAt: new Date().toISOString(),
      },
      status: "ACTIVE",
      organizationId: ctx.organizationId,
    },
  });

  if (input.entityType === "lead") {
    await createActivity({
      type: ActivityType.LEAD_UPDATED,
      message: "Note added on lead",
      actorId: ctx.userId,
      organizationId: ctx.organizationId,
      leadId: input.entityId,
    });
  }

  for (const mentionedUserId of input.mentions) {
    await createNotification({
      title: "You were mentioned in a note",
      body: input.body.slice(0, 160),
      organizationId: ctx.organizationId,
      recipientId: mentionedUserId,
      type: NotificationType.GENERAL,
    });
  }

  return note;
}

export async function listEntityNotes(
  ctx: AuthContext,
  input: { entityType: "lead" | "contact" | "property" | "deal"; entityId: string; limit: number },
) {
  const rows = await prisma.integrationEvent.findMany({
    where: {
      organizationId: ctx.organizationId,
      provider: "CRM_NOTE",
      eventType: "NOTE_ADDED",
    },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(200, input.limit)),
  });

  return rows.filter((row) => {
    const payload = row.payload as { entityType?: string; entityId?: string };
    return payload.entityType === input.entityType && payload.entityId === input.entityId;
  });
}

export async function getUnifiedTimeline(
  ctx: AuthContext,
  input: { entityType: "lead" | "contact" | "property" | "deal"; entityId: string; limit: number },
) {
  const limit = Math.max(1, Math.min(200, input.limit));
  const timeline: Array<Record<string, unknown>> = [];

  if (input.entityType === "lead") {
    const [activities, calls, tasks, visits, deals] = await Promise.all([
      prisma.activity.findMany({
        where: { organizationId: ctx.organizationId, leadId: input.entityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.callLog.findMany({
        where: { organizationId: ctx.organizationId, leadId: input.entityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.task.findMany({
        where: { organizationId: ctx.organizationId, leadId: input.entityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.siteVisit.findMany({
        where: { organizationId: ctx.organizationId, leadId: input.entityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.deal.findMany({
        where: { organizationId: ctx.organizationId, leadId: input.entityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    timeline.push(
      ...activities.map((a) => ({ kind: "activity", at: a.createdAt, data: a })),
      ...calls.map((c) => ({ kind: "call", at: c.createdAt, data: c })),
      ...tasks.map((t) => ({ kind: "task", at: t.createdAt, data: t })),
      ...visits.map((v) => ({ kind: "siteVisit", at: v.createdAt, data: v })),
      ...deals.map((d) => ({ kind: "deal", at: d.createdAt, data: d })),
    );
  }

  if (input.entityType === "property") {
    const [visits, deals] = await Promise.all([
      prisma.siteVisit.findMany({
        where: { organizationId: ctx.organizationId, propertyId: input.entityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.deal.findMany({
        where: { organizationId: ctx.organizationId, propertyId: input.entityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);
    timeline.push(
      ...visits.map((v) => ({ kind: "siteVisit", at: v.createdAt, data: v })),
      ...deals.map((d) => ({ kind: "deal", at: d.createdAt, data: d })),
    );
  }

  if (input.entityType === "deal") {
    const [deal, payments] = await Promise.all([
      prisma.deal.findFirst({
        where: { id: input.entityId, organizationId: ctx.organizationId },
      }),
      prisma.payment.findMany({
        where: { organizationId: ctx.organizationId, dealId: input.entityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);
    if (deal) timeline.push({ kind: "deal", at: deal.createdAt, data: deal });
    timeline.push(...payments.map((p) => ({ kind: "payment", at: p.createdAt, data: p })));
  }

  const notes = await listEntityNotes(ctx, input);
  const workflow = await prisma.integrationEvent.findMany({
    where: {
      organizationId: ctx.organizationId,
      provider: "CRM_WORKFLOW",
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  timeline.push(
    ...notes.map((n) => ({ kind: "note", at: n.createdAt, data: n })),
    ...workflow
      .filter((w) => {
        const payload = w.payload as { entityType?: string; entityId?: string };
        return payload.entityType === input.entityType && payload.entityId === input.entityId;
      })
      .map((w) => ({ kind: "workflow", at: w.createdAt, data: w })),
  );

  return timeline.sort((a, b) => +new Date(b.at as string | Date) - +new Date(a.at as string | Date)).slice(0, limit);
}

export async function getTaskEngineCounters(ctx: AuthContext) {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const [dueToday, overdue, remindersPending] = await Promise.all([
    prisma.task.count({
      where: {
        organizationId: ctx.organizationId,
        dueDate: { gte: new Date(now.setHours(0, 0, 0, 0)), lte: endOfDay },
      },
    }),
    prisma.task.count({
      where: {
        organizationId: ctx.organizationId,
        status: { not: "COMPLETED" },
        dueDate: { lt: new Date() },
      },
    }),
    prisma.task.count({
      where: {
        organizationId: ctx.organizationId,
        status: { not: "COMPLETED" },
        reminderTime: { not: null, lte: new Date() },
      },
    }),
  ]);

  return { dueToday, overdue, remindersPending };
}

export async function suggestPropertyMatches(ctx: AuthContext, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: ctx.organizationId },
  });
  if (!lead) throw new Error("Lead not found");

  const properties = await prisma.property.findMany({
    where: {
      organizationId: ctx.organizationId,
      status: "AVAILABLE",
    },
    include: {
      _count: { select: { deals: true, siteVisits: true } },
    },
    take: 50,
  });

  const scored = properties
    .map((property) => {
      let score = 20;
      if (property.location.toLowerCase().includes(lead.source.toLowerCase())) score += 25;
      if (property.assignedToId && property.assignedToId === lead.assignedToId) score += 20;
      if (property._count.deals === 0) score += 10;
      if (property._count.siteVisits < 3) score += 10;
      score += Math.max(0, 15 - Math.floor(property.price / 10000000));
      return { propertyId: property.id, score: Math.max(1, Math.min(99, score)), property };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  const writes: Promise<unknown>[] = [];
  for (const item of scored) {
    writes.push(
      (async () => {
        const existing = await prisma.propertyLead.findFirst({
          where: { leadId: lead.id, propertyId: item.propertyId, organizationId: ctx.organizationId },
        });
        if (existing) {
          return prisma.propertyLead.update({
            where: { id: existing.id },
            data: { matchScore: item.score },
          });
        }
        return prisma.propertyLead.create({
          data: {
            leadId: lead.id,
            propertyId: item.propertyId,
            matchScore: item.score,
            organizationId: ctx.organizationId,
          },
        });
      })(),
    );
  }
  await Promise.all(writes);

  await createActivity({
    type: ActivityType.LEAD_UPDATED,
    message: `Suggested property matching computed for lead ${lead.name}`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    leadId: lead.id,
  });

  return scored.map(({ property, score }) => ({
    propertyId: property.id,
    propertyName: property.name,
    location: property.location,
    price: property.price,
    score,
  }));
}

export async function transitionPropertyStatus(
  ctx: AuthContext,
  propertyId: string,
  input: { toStatus: "AVAILABLE" | "BLOCKED" | "SOLD"; reason: string },
) {
  assertManagerOrAdmin(ctx);
  const property = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: ctx.organizationId },
  });
  if (!property) throw new Error("Property not found");

  const allowed: Record<PropertyStatus, PropertyStatus[]> = {
    AVAILABLE: [PropertyStatus.BLOCKED, PropertyStatus.SOLD],
    BLOCKED: [PropertyStatus.AVAILABLE, PropertyStatus.SOLD],
    SOLD: [PropertyStatus.BLOCKED],
  };

  const to = input.toStatus as PropertyStatus;
  if (!allowed[property.status].includes(to)) {
    throw new Error(`Invalid status transition from ${property.status} to ${to}`);
  }

  const updated = await prisma.property.update({
    where: { id: property.id },
    data: { status: to },
  });

  await logWorkflowEvent(ctx, "PROPERTY_STATUS_TRANSITION", {
    entityType: "property",
    entityId: property.id,
    fromStatus: property.status,
    toStatus: to,
    reason: input.reason,
    changedBy: ctx.userId,
    changedAt: new Date().toISOString(),
  });

  await createActivity({
    type: ActivityType.LEAD_UPDATED,
    message: `Property ${property.name} status changed from ${property.status} to ${to}`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
  });

  return updated;
}
