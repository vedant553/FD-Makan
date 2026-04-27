import { PropertyStatus } from "@prisma/client";
import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  location: z.string().min(2),
  status: z.nativeEnum(PropertyStatus).optional(),
  assignedToId: z.string().optional(),
});

export const propertyMatchSchema = z.object({
  leadId: z.string().min(1),
});
