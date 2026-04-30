import { SiteVisitStatus } from "@prisma/client";
import { z } from "zod";

export const createSiteVisitSchema = z.object({
  leadId: z.string().min(1),
  propertyId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  status: z.nativeEnum(SiteVisitStatus).optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
  assignedToId: z.string().optional(),
});

export const updateSiteVisitSchema = createSiteVisitSchema.partial();

export const siteVisitFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.nativeEnum(SiteVisitStatus).optional(),
  assignedToId: z.string().optional(),
  leadId: z.string().optional(),
  propertyId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(["scheduledAt", "createdAt", "updatedAt"]).default("scheduledAt"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const updateSiteVisitStatusSchema = z.object({
  status: z.nativeEnum(SiteVisitStatus),
});

export type CreateSiteVisitInput = z.infer<typeof createSiteVisitSchema>;
export type UpdateSiteVisitInput = z.infer<typeof updateSiteVisitSchema>;
export type SiteVisitFilterInput = z.infer<typeof siteVisitFilterSchema>;
