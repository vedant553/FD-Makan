import { ActivityType, PropertyStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createActivity } from "@/lib/services/activity.service";
import type { AuthContext } from "@/lib/services/types";

type CreatePropertyInput = {
  name: string;
  price: number;
  location: string;
  status?: PropertyStatus;
  assignedToId?: string;
};

export async function createProperty(ctx: AuthContext, input: CreatePropertyInput) {
  if (input.assignedToId) {
    const assignee = await prisma.user.findFirst({ where: { id: input.assignedToId, organizationId: ctx.organizationId } });
    if (!assignee) throw new Error("Assigned user not found");
  }

  return prisma.property.create({
    data: {
      ...input,
      status: input.status ?? PropertyStatus.AVAILABLE,
      organizationId: ctx.organizationId,
    },
  });
}

export async function listProperties(ctx: AuthContext) {
  return prisma.property.findMany({
    where: { organizationId: ctx.organizationId },
    include: {
      assignedTo: { select: { id: true, name: true } },
      _count: { select: { leads: true, siteVisits: true, deals: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function matchPropertiesForLead(ctx: AuthContext, leadId: string) {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, organizationId: ctx.organizationId } });
  if (!lead) throw new Error("Lead not found");

  const properties = await prisma.property.findMany({
    where: {
      organizationId: ctx.organizationId,
      status: PropertyStatus.AVAILABLE,
      location: { contains: lead.source, mode: "insensitive" },
    },
    take: 10,
  });

  const links = [];
  for (const property of properties) {
    const existing = await prisma.propertyLead.findFirst({
      where: { organizationId: ctx.organizationId, leadId: lead.id, propertyId: property.id },
    });

    if (!existing) {
      links.push(
        await prisma.propertyLead.create({
          data: {
            leadId: lead.id,
            propertyId: property.id,
            matchScore: Math.min(95, 50 + Math.floor(Math.random() * 45)),
            organizationId: ctx.organizationId,
          },
        }),
      );
    }
  }

  await createActivity({
    type: ActivityType.LEAD_UPDATED,
    message: `Property matching executed for lead ${lead.name}`,
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    leadId: lead.id,
  });

  return links;
}
