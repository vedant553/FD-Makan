import { CallStatus } from "@prisma/client";
import { z } from "zod";

export const callSchema = z.object({
  phone: z.string().min(7),
  leadId: z.string().optional(),
  status: z.nativeEnum(CallStatus),
  duration: z.number().int().min(0),
  notes: z.string().optional(),
});
