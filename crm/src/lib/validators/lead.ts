import { LeadStatus } from "@prisma/client";
import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  source: z.string().min(2),
  status: z.nativeEnum(LeadStatus).optional(),
  assignedToId: z.string().optional().nullable(),
  campaignId: z.string().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();
