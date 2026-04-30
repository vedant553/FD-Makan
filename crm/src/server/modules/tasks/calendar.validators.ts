import { z } from "zod";

export const calendarRangeSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  from: z.coerce.date(),
  to: z.coerce.date(),
  source: z.enum(["TASK", "SITE_VISIT", "ALL"]).default("ALL"),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
});

export const createCalendarEventSchema = z.object({
  sourceType: z.enum(["TASK", "SITE_VISIT"]),
  title: z.string().min(2),
  leadId: z.string().min(1),
  assignedToId: z.string().optional(),
  propertyId: z.string().optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional(),
  status: z.string().optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial().extend({
  sourceType: z.enum(["TASK", "SITE_VISIT"]).optional(),
});

export type CalendarRangeInput = z.infer<typeof calendarRangeSchema>;
export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;
