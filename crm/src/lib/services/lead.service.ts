import { ActivityType, LeadStatus, TaskPriority, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { canAccessUserData } from "@/lib/auth/guards";
import { createActivity } from "@/lib/services/activity.service";
import { runAutomation } from "@/lib/services/automation.service";
import { updateCampaignDerivedStats } from "@/lib/services/campaign.service";
import type { AuthContext } from "@/lib/services/types";

type LeadInput = {
  name: string;
  phone: string;
  email?: string | null;
  source: string;
  status?: LeadStatus;
  assignedToId?: string | null;
  campaignId?: string | null;
};

async function getAutoAssignee(organizationId: string) {
  const user = await prisma.user.findFirst({
    where: { organizationId, role: { in: ["MANAGER", "AGENT"] } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return user?.id;
}

export async function createLead(ctx: AuthContext, input: LeadInput) {
  const assignedToId = input.assignedToId ?? (await getAutoAssignee(ctx.organizationId)) ?? ctx.userId;

  if (!canAccessUserData({ id: ctx.userId, role: ctx.role }, assignedToId)) {
    throw new Error("Forbidden");
  }

  const assignee = await prisma.user.findFirst({
    where: { id: assignedToId, organizationId: ctx.organizationId },
  });

  if (!assignee) throw new Error("Assigned user not found");

  if (input.campaignId) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: input.campaignId, organizationId: ctx.organizationId },
    });
    if (!campaign) throw new Error("Campaign not found");
  }

  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      source: input.source,
      status: input.status ?? LeadStatus.NEW,
      assignedToId,
      campaignId: input.campaignId,
      organizationId: ctx.organizationId,
    },
  });

  const followUpDue = new Date();
  followUpDue.setDate(followUpDue.getDate() + 1);
  followUpDue.setHours(11, 0, 0, 0);

  await prisma.task.create({
    data: {
      title: `Follow up with ${lead.name}`,
      description: `Initial follow-up created automatically for lead ${lead.name}.`,
      leadId: lead.id,
      assignedToId: lead.assignedToId ?? ctx.userId,
      createdById: ctx.userId,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      dueDate: followUpDue,
      reminderTime: new Date(followUpDue.getTime() - 60 * 60 * 1000),
      organizationId: ctx.organizationId,
    },
  });

  await createActivity({
    type: ActivityType.LEAD_CREATED,
    message: `Lead "${lead.name}" created and assigned`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    leadId: lead.id,
  });

  if (lead.campaignId) {
    await updateCampaignDerivedStats(lead.campaignId, ctx.organizationId);
  }

  await runAutomation("LEAD_CREATED", { ...ctx, leadId: lead.id }, { status: lead.status });

  return lead;
}

export async function listLeads(ctx: AuthContext) {
  return prisma.lead.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      campaign: {
        select: { id: true, name: true, source: true },
      },
      _count: {
        select: { tasks: true, callLogs: true, deals: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateLead(ctx: AuthContext, leadId: string, input: Partial<LeadInput>) {
  const existing = await prisma.lead.findFirst({
    where: {
      id: leadId,
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    },
  });

  if (!existing) throw new Error("Lead not found");

  if (input.assignedToId !== undefined) {
    if (!canAccessUserData({ id: ctx.userId, role: ctx.role }, input.assignedToId)) {
      throw new Error("Forbidden");
    }

    if (input.assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: { id: input.assignedToId, organizationId: ctx.organizationId },
      });

      if (!assignee) throw new Error("Assigned user not found");
    }
  }

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      ...input,
      email: input.email === "" ? null : input.email,
    },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      campaign: {
        select: { id: true, name: true },
      },
    },
  });

  await createActivity({
    type: ActivityType.LEAD_UPDATED,
    message: `Lead "${lead.name}" updated`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    leadId: lead.id,
  });

  if (lead.campaignId) {
    await updateCampaignDerivedStats(lead.campaignId, ctx.organizationId);
  }

  return lead;
}
