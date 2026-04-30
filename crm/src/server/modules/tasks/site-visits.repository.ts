import { SiteVisitStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { AuthContext } from "@/lib/services/types";
import type {
  CreateSiteVisitInput,
  SiteVisitFilterInput,
  UpdateSiteVisitInput,
} from "@/server/modules/tasks/site-visits.validators";

export async function findLeadAndPropertyForVisit(ctx: AuthContext, leadId: string, propertyId: string) {
  const [lead, property] = await Promise.all([
    prisma.lead.findFirst({ where: { id: leadId, organizationId: ctx.organizationId } }),
    prisma.property.findFirst({ where: { id: propertyId, organizationId: ctx.organizationId } }),
  ]);
  return { lead, property };
}

export async function createSiteVisitRecord(ctx: AuthContext, input: CreateSiteVisitInput) {
  return prisma.siteVisit.create({
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
}

export async function listSiteVisitRecords(ctx: AuthContext) {
  return listSiteVisitRecordsWithFilters(ctx, {
    page: 1,
    limit: 20,
    sortBy: "scheduledAt",
    sortOrder: "asc",
  });
}

export async function listSiteVisitRecordsWithFilters(ctx: AuthContext, filters: SiteVisitFilterInput) {
  const where = {
    organizationId: ctx.organizationId,
    ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : {}),
    ...(filters.leadId ? { leadId: filters.leadId } : {}),
    ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          scheduledAt: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateTo ? { lte: filters.dateTo } : {}),
          },
        }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { notes: { contains: filters.search, mode: "insensitive" as const } },
            { lead: { name: { contains: filters.search, mode: "insensitive" as const } } },
            { property: { name: { contains: filters.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const skip = (filters.page - 1) * filters.limit;
  const orderBy = { [filters.sortBy]: filters.sortOrder } as const;

  const [items, total] = await prisma.$transaction([
    prisma.siteVisit.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true } },
        property: { select: { id: true, name: true, location: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy,
      skip,
      take: filters.limit,
    }),
    prisma.siteVisit.count({ where }),
  ]);

  return { items, total };
}

export async function findSiteVisitById(ctx: AuthContext, id: string) {
  return prisma.siteVisit.findFirst({
    where: {
      id,
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    },
    include: {
      lead: { select: { id: true, name: true } },
      property: { select: { id: true, name: true, location: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
}

export async function updateSiteVisitRecord(id: string, input: UpdateSiteVisitInput) {
  return prisma.siteVisit.update({
    where: { id },
    data: input,
    include: {
      lead: { select: { id: true, name: true } },
      property: { select: { id: true, name: true, location: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
}

export async function deleteSiteVisitRecord(id: string) {
  return prisma.siteVisit.delete({ where: { id } });
}

export async function updateSiteVisitStatusRecord(id: string, status: SiteVisitStatus) {
  return prisma.siteVisit.update({
    where: { id },
    data: { status },
    include: {
      lead: { select: { id: true, name: true } },
      property: { select: { id: true, name: true, location: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
}
