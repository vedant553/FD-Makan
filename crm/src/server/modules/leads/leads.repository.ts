import { LeadStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { AuthContext } from "@/lib/services/types";
import { getSkip } from "@/server/core/pagination";
import type { CreateLeadInput, LeadsListQuery, UpdateLeadInput } from "@/server/modules/leads/leads.validators";

function buildWhere(ctx: AuthContext, query: LeadsListQuery): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {
    organizationId: ctx.organizationId,
  };

  if (ctx.role === "AGENT") {
    where.assignedToId = ctx.userId;
  } else if (query.assignedToId) {
    where.assignedToId = query.assignedToId;
  }

  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function findAssignee(orgId: string, assignedToId: string) {
  return prisma.user.findFirst({
    where: { id: assignedToId, organizationId: orgId },
  });
}

export async function findCampaign(orgId: string, campaignId: string) {
  return prisma.campaign.findFirst({
    where: { id: campaignId, organizationId: orgId },
  });
}

export async function findAutoAssignee(orgId: string) {
  return prisma.user.findFirst({
    where: { organizationId: orgId, role: { in: ["MANAGER", "AGENT"] } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}

export async function createLeadRecord(ctx: AuthContext, input: CreateLeadInput, assignedToId: string) {
  return prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      source: input.source,
      status: input.status ?? LeadStatus.NEW,
      assignedToId,
      campaignId: input.campaignId ?? null,
      organizationId: ctx.organizationId,
    },
  });
}

export async function listLeadRecords(ctx: AuthContext, query: LeadsListQuery) {
  const where = buildWhere(ctx, query);
  const sortBy = query.sortBy === "updatedAt" ? "updatedAt" : "createdAt";
  const orderBy: Prisma.LeadOrderByWithRelationInput = { [sortBy]: query.sortOrder };

  const [items, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        campaign: { select: { id: true, name: true, source: true } },
        _count: { select: { tasks: true, callLogs: true, deals: true } },
      },
      orderBy,
      skip: getSkip(query.page, query.pageSize),
      take: query.pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, total };
}

export async function findLeadById(ctx: AuthContext, leadId: string) {
  return prisma.lead.findFirst({
    where: {
      id: leadId,
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    },
  });
}

export async function updateLeadRecord(leadId: string, input: UpdateLeadInput) {
  return prisma.lead.update({
    where: { id: leadId },
    data: {
      ...input,
      email: input.email === "" ? null : input.email,
      campaignId: input.campaignId === "" ? null : input.campaignId,
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      campaign: { select: { id: true, name: true, source: true } },
    },
  });
}

export async function createLeadFollowUpTask(ctx: AuthContext, leadId: string, leadName: string, assignedToId: string) {
  const followUpDue = new Date();
  followUpDue.setDate(followUpDue.getDate() + 1);
  followUpDue.setHours(11, 0, 0, 0);

  return prisma.task.create({
    data: {
      title: `Follow up with ${leadName}`,
      description: `Initial follow-up created automatically for lead ${leadName}.`,
      leadId,
      assignedToId,
      createdById: ctx.userId,
      dueDate: followUpDue,
      reminderTime: new Date(followUpDue.getTime() - 60 * 60 * 1000),
      organizationId: ctx.organizationId,
    },
  });
}
