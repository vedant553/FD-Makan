import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  leadId: z.string().min(1),
  assignedToId: z.string().optional().nullable(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  dueDate: z.coerce.date(),
  reminderTime: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  markComplete: z.boolean().optional(),
});

export const taskFilterSchema = z.object({
  view: z.enum(["today", "upcoming", "overdue", "completed"]).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedToId: z.string().optional(),
  search: z.string().optional(),
  date: z.coerce.date().optional(),
});

