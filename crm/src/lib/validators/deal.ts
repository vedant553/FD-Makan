import { DealStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";

export const dealSchema = z.object({
  leadId: z.string().min(1),
  propertyId: z.string().min(1),
  value: z.number().positive(),
  status: z.nativeEnum(DealStatus).optional(),
});

export const paymentSchema = z.object({
  dealId: z.string().min(1),
  amount: z.number().positive(),
  status: z.nativeEnum(PaymentStatus).optional(),
  date: z.coerce.date().optional(),
});
