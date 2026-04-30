import { ActivityType, SiteVisitStatus } from "@prisma/client";

import { createActivity } from "@/lib/services/activity.service";
import type { AuthContext } from "@/lib/services/types";
import { TasksDomainError } from "@/server/modules/tasks/tasks.domain";
import { logTaskEvent } from "@/server/modules/tasks/tasks.logger";
import type { CreateSiteVisitInput } from "@/server/modules/tasks/site-visits.validators";
import {
  createSiteVisitRecord,
  deleteSiteVisitRecord,
  findSiteVisitById,
  findLeadAndPropertyForVisit,
  listSiteVisitRecordsWithFilters,
  updateSiteVisitRecord,
  updateSiteVisitStatusRecord,
} from "@/server/modules/tasks/site-visits.repository";
import type { SiteVisitFilterInput, UpdateSiteVisitInput } from "@/server/modules/tasks/site-visits.validators";

export async function listSiteVisits(ctx: AuthContext, filters: SiteVisitFilterInput) {
  const { items, total } = await listSiteVisitRecordsWithFilters(ctx, filters);
  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function createSiteVisit(ctx: AuthContext, input: CreateSiteVisitInput) {
  const { lead, property } = await findLeadAndPropertyForVisit(ctx, input.leadId, input.propertyId);
  if (!lead) throw new TasksDomainError("Lead not found", "NOT_FOUND", 404);
  if (!property) throw new TasksDomainError("Property not found", "NOT_FOUND", 404);

  const siteVisit = await createSiteVisitRecord(ctx, input);

  await createActivity({
    type: ActivityType.SITE_VISIT_SCHEDULED,
    message: `Site visit scheduled for ${lead.name} at ${property.name}`,
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    leadId: lead.id,
  });

  logTaskEvent("info", "SITE_VISIT_CREATED", ctx, {
    siteVisitId: siteVisit.id,
    leadId: siteVisit.leadId,
    propertyId: siteVisit.propertyId,
  });

  return siteVisit;
}

export async function getSiteVisitById(ctx: AuthContext, id: string) {
  const siteVisit = await findSiteVisitById(ctx, id);
  if (!siteVisit) throw new TasksDomainError("Site visit not found", "NOT_FOUND", 404);
  return siteVisit;
}

export async function updateSiteVisit(ctx: AuthContext, id: string, input: UpdateSiteVisitInput) {
  const existing = await findSiteVisitById(ctx, id);
  if (!existing) throw new TasksDomainError("Site visit not found", "NOT_FOUND", 404);
  const updated = await updateSiteVisitRecord(id, input);
  logTaskEvent("info", "SITE_VISIT_CREATED", ctx, { siteVisitId: id, action: "updated" });
  return updated;
}

export async function deleteSiteVisit(ctx: AuthContext, id: string) {
  const existing = await findSiteVisitById(ctx, id);
  if (!existing) throw new TasksDomainError("Site visit not found", "NOT_FOUND", 404);
  await deleteSiteVisitRecord(id);
  logTaskEvent("info", "SITE_VISIT_CREATED", ctx, { siteVisitId: id, action: "deleted" });
  return { success: true };
}

export async function transitionSiteVisitStatus(ctx: AuthContext, id: string, status: SiteVisitStatus) {
  const existing = await findSiteVisitById(ctx, id);
  if (!existing) throw new TasksDomainError("Site visit not found", "NOT_FOUND", 404);
  const updated = await updateSiteVisitStatusRecord(id, status);
  logTaskEvent("info", "SITE_VISIT_CREATED", ctx, { siteVisitId: id, action: "status-transition", status });
  return updated;
}
