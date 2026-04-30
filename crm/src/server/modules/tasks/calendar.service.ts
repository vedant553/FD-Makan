import { TaskPriority, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { AuthContext } from "@/lib/services/types";
import { TasksDomainError } from "@/server/modules/tasks/tasks.domain";
import { createSiteVisit, deleteSiteVisit, getSiteVisitById, updateSiteVisit } from "@/server/modules/tasks/site-visits.service";
import { createTask, deleteTask, getTaskById, updateTask } from "@/server/modules/tasks/tasks.service";
import type {
  CalendarRangeInput,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "@/server/modules/tasks/calendar.validators";

export async function listCalendarEvents(ctx: AuthContext, input: CalendarRangeInput) {
  const taskWhere = {
    organizationId: ctx.organizationId,
    dueDate: { gte: input.from, lte: input.to },
    ...(ctx.role === "AGENT" ? { OR: [{ assignedToId: ctx.userId }, { createdById: ctx.userId }] } : {}),
    ...(input.assigneeId ? { assignedToId: input.assigneeId } : {}),
    ...(input.search
      ? {
          OR: [
            { title: { contains: input.search, mode: "insensitive" as const } },
            { description: { contains: input.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const visitWhere = {
    organizationId: ctx.organizationId,
    scheduledAt: { gte: input.from, lte: input.to },
    ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    ...(input.assigneeId ? { assignedToId: input.assigneeId } : {}),
    ...(input.search
      ? {
          OR: [
            { notes: { contains: input.search, mode: "insensitive" as const } },
            { lead: { name: { contains: input.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [tasks, siteVisits] = await Promise.all([
    input.source === "SITE_VISIT"
      ? Promise.resolve([])
      : prisma.task.findMany({
          where: taskWhere,
          include: {
            lead: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
          },
          orderBy: { dueDate: "asc" },
        }),
    input.source === "TASK"
      ? Promise.resolve([])
      : prisma.siteVisit.findMany({
          where: visitWhere,
          include: {
            lead: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
          },
          orderBy: { scheduledAt: "asc" },
        }),
  ]);

  const normalized = [
    ...tasks.map((task) => ({
      id: `TASK:${task.id}`,
      sourceType: "TASK" as const,
      sourceId: task.id,
      title: task.title,
      startAt: task.dueDate,
      endAt: null,
      status: task.status,
      lead: task.lead,
      assignee: task.assignedTo,
      meta: { priority: task.priority },
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })),
    ...siteVisits.map((visit) => ({
      id: `SITE_VISIT:${visit.id}`,
      sourceType: "SITE_VISIT" as const,
      sourceId: visit.id,
      title: `Site Visit - ${visit.lead.name}`,
      startAt: visit.scheduledAt,
      endAt: null,
      status: visit.status,
      lead: visit.lead,
      assignee: visit.assignedTo,
      meta: {},
      createdAt: visit.createdAt,
      updatedAt: visit.updatedAt,
    })),
  ].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  const start = (input.page - 1) * input.limit;
  const end = start + input.limit;

  return {
    items: normalized.slice(start, end),
    pagination: {
      page: input.page,
      limit: input.limit,
      total: normalized.length,
      totalPages: Math.ceil(normalized.length / input.limit),
    },
  };
}

export async function createCalendarEvent(ctx: AuthContext, input: CreateCalendarEventInput) {
  if (input.sourceType === "TASK") {
    const task = await createTask(ctx, {
      title: input.title,
      description: input.description ?? null,
      leadId: input.leadId,
      assignedToId: input.assignedToId ?? null,
      priority: (input.priority as TaskPriority | undefined) ?? TaskPriority.MEDIUM,
      status: (input.status as TaskStatus | undefined) ?? TaskStatus.PENDING,
      dueDate: input.startAt,
      reminderTime: null,
    });
    return { id: `TASK:${task.id}`, sourceType: "TASK", sourceId: task.id };
  }

  if (!input.propertyId) throw new TasksDomainError("propertyId is required for SITE_VISIT event", "BAD_REQUEST", 400);
  const siteVisit = await createSiteVisit(ctx, {
    leadId: input.leadId,
    propertyId: input.propertyId,
    scheduledAt: input.startAt,
    notes: input.description ?? undefined,
    assignedToId: input.assignedToId,
  });
  return { id: `SITE_VISIT:${siteVisit.id}`, sourceType: "SITE_VISIT", sourceId: siteVisit.id };
}

function parseCalendarCompositeId(id: string) {
  const [sourceType, sourceId] = id.split(":");
  if (!sourceType || !sourceId || (sourceType !== "TASK" && sourceType !== "SITE_VISIT")) {
    throw new TasksDomainError("Invalid calendar event id", "BAD_REQUEST", 400);
  }
  return { sourceType, sourceId } as const;
}

export async function getCalendarEventById(ctx: AuthContext, id: string) {
  const { sourceType, sourceId } = parseCalendarCompositeId(id);
  if (sourceType === "TASK") {
    const task = await getTaskById(ctx, sourceId);
    return {
      id,
      sourceType,
      sourceId,
      title: task.title,
      startAt: task.dueDate,
      status: task.status,
      leadId: task.leadId,
      assignedToId: task.assignedToId,
      description: task.description,
    };
  }

  const siteVisit = await getSiteVisitById(ctx, sourceId);
  return {
    id,
    sourceType,
    sourceId,
    title: `Site Visit - ${siteVisit.lead.name}`,
    startAt: siteVisit.scheduledAt,
    status: siteVisit.status,
    leadId: siteVisit.leadId,
    assignedToId: siteVisit.assignedToId,
    description: siteVisit.notes,
    propertyId: siteVisit.propertyId,
  };
}

export async function updateCalendarEvent(ctx: AuthContext, id: string, input: UpdateCalendarEventInput) {
  const { sourceType, sourceId } = parseCalendarCompositeId(id);
  if (sourceType === "TASK") {
    const task = await updateTask(ctx, sourceId, {
      ...(input.title ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description ?? null } : {}),
      ...(input.assignedToId !== undefined ? { assignedToId: input.assignedToId ?? null } : {}),
      ...(input.priority ? { priority: input.priority as TaskPriority } : {}),
      ...(input.status ? { status: input.status as TaskStatus } : {}),
      ...(input.startAt ? { dueDate: input.startAt } : {}),
    });
    return { id: `TASK:${task.id}`, sourceType: "TASK", sourceId: task.id };
  }

  const siteVisit = await updateSiteVisit(ctx, sourceId, {
    ...(input.leadId ? { leadId: input.leadId } : {}),
    ...(input.propertyId ? { propertyId: input.propertyId } : {}),
    ...(input.startAt ? { scheduledAt: input.startAt } : {}),
    ...(input.status ? { status: input.status as never } : {}),
    ...(input.description !== undefined ? { notes: input.description ?? undefined } : {}),
    ...(input.assignedToId !== undefined ? { assignedToId: input.assignedToId } : {}),
  });
  return { id: `SITE_VISIT:${siteVisit.id}`, sourceType: "SITE_VISIT", sourceId: siteVisit.id };
}

export async function deleteCalendarEvent(ctx: AuthContext, id: string) {
  const { sourceType, sourceId } = parseCalendarCompositeId(id);
  if (sourceType === "TASK") {
    return deleteTask(ctx, sourceId);
  }
  return deleteSiteVisit(ctx, sourceId);
}
