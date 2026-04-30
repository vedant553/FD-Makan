import { z } from "zod";

export const leadTransferSchema = z.object({
  leadIds: z.array(z.string().min(1)).min(1),
  toUserId: z.string().min(1),
  reason: z.string().min(3),
});

export const dealWorkflowUpdateSchema = z.object({
  stage: z.enum(["OPEN", "WON", "LOST", "CLOSED"]),
  approvalStatus: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  remark: z.string().optional(),
});

export const createNoteSchema = z.object({
  entityType: z.enum(["lead", "contact", "property", "deal"]),
  entityId: z.string().min(1),
  body: z.string().min(1),
  mentions: z.array(z.string().min(1)).optional().default([]),
});

export const timelineQuerySchema = z.object({
  entityType: z.enum(["lead", "contact", "property", "deal"]),
  entityId: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const propertyStatusTransitionSchema = z.object({
  toStatus: z.enum(["AVAILABLE", "BLOCKED", "SOLD"]),
  reason: z.string().min(3),
});
