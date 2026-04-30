import { ActivityType } from "@prisma/client";

import { canAccessUserData } from "@/lib/auth/guards";
import { createActivity } from "@/lib/services/activity.service";
import { runAutomation } from "@/lib/services/automation.service";
import { updateCampaignDerivedStats } from "@/lib/services/campaign.service";
import type { AuthContext } from "@/lib/services/types";
import { AppError, ForbiddenError, NotFoundError } from "@/server/core/errors";
import { toPaginationMeta } from "@/server/core/pagination";
import {
  createLeadFollowUpTask,
  createLeadRecord,
  findAssignee,
  findAutoAssignee,
  findCampaign,
  findLeadById,
  listLeadRecords,
  updateLeadRecord,
} from "@/server/modules/leads/leads.repository";
import type { CreateLeadInput, LeadsListQuery, UpdateLeadInput } from "@/server/modules/leads/leads.validators";

async function resolveAssignee(ctx: AuthContext, input: CreateLeadInput) {
  const candidate = input.assignedToId ?? (await findAutoAssignee(ctx.organizationId))?.id ?? ctx.userId;
  if (!canAccessUserData({ id: ctx.userId, role: ctx.role }, candidate)) {
    throw new ForbiddenError();
  }

  const assignee = await findAssignee(ctx.organizationId, candidate);
  if (!assignee) throw new NotFoundError("Assigned user not found");
  return assignee.id;
}

export async function listLeads(ctx: AuthContext, query: LeadsListQuery) {
  const { items, total } = await listLeadRecords(ctx, query);
  return {
    items,
    pagination: toPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function createLead(ctx: AuthContext, input: CreateLeadInput) {
  const assignedToId = await resolveAssignee(ctx, input);

  if (input.campaignId) {
    const campaign = await findCampaign(ctx.organizationId, input.campaignId);
    if (!campaign) throw new NotFoundError("Campaign not found");
  }

  const lead = await createLeadRecord(ctx, input, assignedToId);
  await createLeadFollowUpTask(ctx, lead.id, lead.name, lead.assignedToId ?? ctx.userId);

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

export async function updateLead(ctx: AuthContext, leadId: string, input: UpdateLeadInput) {
  const existing = await findLeadById(ctx, leadId);
  if (!existing) throw new NotFoundError("Lead not found");

  if (input.assignedToId !== undefined) {
    if (!canAccessUserData({ id: ctx.userId, role: ctx.role }, input.assignedToId)) {
      throw new ForbiddenError();
    }
    if (input.assignedToId) {
      const assignee = await findAssignee(ctx.organizationId, input.assignedToId);
      if (!assignee) throw new NotFoundError("Assigned user not found");
    }
  }

  if (input.campaignId) {
    const campaign = await findCampaign(ctx.organizationId, input.campaignId);
    if (!campaign) throw new NotFoundError("Campaign not found");
  }

  if (Object.keys(input).length === 0) {
    throw new AppError("No lead fields provided for update", "BAD_REQUEST", 400);
  }

  const lead = await updateLeadRecord(leadId, input);
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
