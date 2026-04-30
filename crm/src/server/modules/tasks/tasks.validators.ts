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
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  view: z.enum(["today", "upcoming", "overdue", "completed"]).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  type: z.string().optional(),
  activityType: z.string().optional(),
  assignedToId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(["dueDate", "createdAt", "updatedAt"]).default("dueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const assignTaskSchema = z.object({
  assignedToId: z.string().min(1),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
