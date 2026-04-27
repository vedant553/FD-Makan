import { ActivityType, SiteVisitStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createActivity } from "@/lib/services/activity.service";
import type { AuthContext } from "@/lib/services/types";

type CreateSiteVisitInput = {
  leadId: string;
  propertyId: string;
  scheduledAt: Date;
  status?: SiteVisitStatus;
  notes?: string;
  photos?: string[];
  assignedToId?: string;
};

export async function createSiteVisit(ctx: AuthContext, input: CreateSiteVisitInput) {
  const [lead, property] = await Promise.all([
    prisma.lead.findFirst({ where: { id: input.leadId, organizationId: ctx.organizationId } }),
    prisma.property.findFirst({ where: { id: input.propertyId, organizationId: ctx.organizationId } }),
  ]);

  if (!lead) throw new Error("Lead not found");
  if (!property) throw new Error("Property not found");

  const visit = await prisma.siteVisit.create({
    data: {
      ...input,
      status: input.status ?? SiteVisitStatus.SCHEDULED,
      photos: input.photos ?? [],
      organizationId: ctx.organizationId,
    },
    include: {
      lead: { select: { id: true, name: true } },
      property: { select: { id: true, name: true, location: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  await createActivity({
    type: ActivityType.SITE_VISIT_SCHEDULED,
    message: `Site visit scheduled for ${lead.name} at ${property.name}`,
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    leadId: lead.id,
  });

  return visit;
}

export async function listSiteVisits(ctx: AuthContext) {
  return prisma.siteVisit.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    },
    include: {
      lead: { select: { id: true, name: true } },
      property: { select: { id: true, name: true, location: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}
