import { LeadStatus } from "@prisma/client";
import { z } from "zod";

import { listQuerySchema } from "@/server/core/pagination";

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

export const leadsListQuerySchema = listQuerySchema.extend({
  status: z.nativeEnum(LeadStatus).optional(),
  assignedToId: z.string().optional(),
  source: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadsListQuery = z.infer<typeof leadsListQuerySchema>;
