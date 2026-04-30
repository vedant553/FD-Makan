import { Prisma, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { AuthContext } from "@/lib/services/types";
import type { CreateTaskInput, TaskFilterInput, UpdateTaskInput } from "@/server/modules/tasks/tasks.validators";
import { endOfToday, startOfToday } from "@/lib/utils";

function buildTaskWhere(ctx: AuthContext, filters: TaskFilterInput): Prisma.TaskWhereInput {
  const and: Prisma.TaskWhereInput[] = [];
  const where: Prisma.TaskWhereInput = {
    organizationId: ctx.organizationId,
  };

  if (ctx.role === "AGENT") {
    and.push({
      OR: [{ assignedToId: ctx.userId }, { createdById: ctx.userId }],
    });
  }

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedToId && ctx.role !== "AGENT") where.assignedToId = filters.assignedToId;

  if (filters.search) {
    and.push({
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { lead: { name: { contains: filters.search, mode: "insensitive" } } },
      ],
    });
  }

  if (filters.dateFrom || filters.dateTo) {
    and.push({
      dueDate: {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      },
    });
  }

  const now = new Date();
  const start = filters.dateFrom ? new Date(filters.dateFrom) : startOfToday();
  const end = filters.dateTo ? new Date(filters.dateTo) : endOfToday();
  if (filters.dateTo) end.setHours(23, 59, 59, 999);

  if (filters.view === "today") {
    and.push({ dueDate: { gte: start, lte: end } });
    and.push({ status: { not: TaskStatus.COMPLETED } });
  }

  if (filters.view === "upcoming") {
    and.push({ dueDate: { gt: endOfToday() } });
    and.push({ status: { not: TaskStatus.COMPLETED } });
  }

  if (filters.view === "overdue") {
    and.push({ dueDate: { lt: now } });
    and.push({ status: { not: TaskStatus.COMPLETED } });
  }

  if (filters.view === "completed") {
    and.push({ status: TaskStatus.COMPLETED });
  }

  if (and.length) where.AND = and;
  return where;
}

export async function findTaskLeadAndAssignee(
  ctx: AuthContext,
  leadId: string,
  assignedToId?: string | null,
) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: ctx.organizationId },
  });

  const assignee = assignedToId
    ? await prisma.user.findFirst({
        where: { id: assignedToId, organizationId: ctx.organizationId },
      })
    : null;

  return { lead, assignee };
}

export async function createTaskRecord(ctx: AuthContext, input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      ...input,
      organizationId: ctx.organizationId,
      createdById: ctx.userId,
      isOverdue: input.status !== TaskStatus.COMPLETED && input.dueDate < new Date(),
    },
    include: {
      lead: true,
      assignedTo: true,
    },
  });
}

export async function listTaskRecords(ctx: AuthContext, filters: TaskFilterInput) {
  const where = buildTaskWhere(ctx, filters);
  const orderBy = { [filters.sortBy]: filters.sortOrder } as Prisma.TaskOrderByWithRelationInput;
  const skip = (filters.page - 1) * filters.limit;

  const [items, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy,
      skip,
      take: filters.limit,
    }),
    prisma.task.count({ where }),
  ]);

  return { items, total };
}

export async function findTaskById(ctx: AuthContext, taskId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT"
        ? {
            OR: [{ assignedToId: ctx.userId }, { createdById: ctx.userId }],
          }
        : {}),
    },
    include: {
      assignedTo: true,
      lead: true,
    },
  });
}

export async function updateTaskRecord(
  taskId: string,
  updates: UpdateTaskInput,
  status: TaskStatus,
  dueDate: Date,
) {
  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...updates,
      status,
      isOverdue: status !== TaskStatus.COMPLETED && dueDate < new Date(),
    },
    include: {
      assignedTo: true,
      lead: true,
    },
  });
}

export async function findTaskForDelete(ctx: AuthContext, taskId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { createdById: ctx.userId } : {}),
    },
  });
}

export async function deleteTaskRecord(taskId: string) {
  return prisma.task.delete({ where: { id: taskId } });
}
