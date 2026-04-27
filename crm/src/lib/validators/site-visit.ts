import { SiteVisitStatus } from "@prisma/client";
import { z } from "zod";

export const siteVisitSchema = z.object({
  leadId: z.string().min(1),
  propertyId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  status: z.nativeEnum(SiteVisitStatus).optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
  assignedToId: z.string().optional(),
});
