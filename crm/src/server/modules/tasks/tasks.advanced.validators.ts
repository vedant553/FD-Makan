import { MessageChannel } from "@prisma/client";
import { z } from "zod";

export const bulkAssignSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1),
  assignedToId: z.string().min(1),
});

export const assignmentSuggestionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
  leadId: z.string().optional(),
});

export const timelineQuerySchema = z.object({
  leadId: z.string().optional(),
  taskId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const quickActionSchema = z.object({
  action: z.enum(["WA", "NOTE", "EMAIL", "CALL", "SMS"]),
  leadId: z.string().min(1),
  taskId: z.string().optional(),
  content: z.string().min(1),
  templateId: z.string().optional(),
  phone: z.string().optional(),
  emailTo: z.string().email().optional(),
});

export const recurringTaskSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  firstDueDate: z.coerce.date(),
  intervalDays: z.coerce.number().int().min(1).default(7),
  occurrences: z.coerce.number().int().min(1).max(52).default(4),
});

export const followupSequenceSchema = z.object({
  leadId: z.string().min(1),
  assignedToId: z.string().optional().nullable(),
  steps: z
    .array(
      z.object({
        title: z.string().min(2),
        description: z.string().optional().nullable(),
        offsetHours: z.coerce.number().int().min(1),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
      }),
    )
    .min(1),
});

export const slaQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  assigneeId: z.string().optional(),
});

export const reminderRunSchema = z.object({
  preDueWindowMinutes: z.coerce.number().int().min(5).max(1440).default(30),
});

export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;
export type QuickActionInput = z.infer<typeof quickActionSchema>;
export type RecurringTaskInput = z.infer<typeof recurringTaskSchema>;
export type FollowupSequenceInput = z.infer<typeof followupSequenceSchema>;
