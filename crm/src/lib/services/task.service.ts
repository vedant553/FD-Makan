import { ActivityType, NotificationType, Prisma, TaskPriority, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { canAccessUserData } from "@/lib/auth/guards";
import { createActivity } from "@/lib/services/activity.service";
import { runAutomation, runTimeBasedAutomations } from "@/lib/services/automation.service";
import { createNotification } from "@/lib/services/notification.service";
import type { AuthContext } from "@/lib/services/types";
import { endOfToday, startOfToday } from "@/lib/utils";

type TaskInput = {
  title: string;
  description?: string | null;
  leadId: string;
  assignedToId?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  reminderTime?: Date | null;
};

type TaskFilters = {
  view?: "today" | "upcoming" | "overdue" | "completed";
  priority?: TaskPriority;
  assignedToId?: string;
  search?: string;
  date?: Date;
};

function assertCanManageTask(ctx: AuthContext, assignedToId?: string | null) {
  if (!canAccessUserData({ id: ctx.userId, role: ctx.role }, assignedToId)) {
    throw new Error("Forbidden");
  }
}

async function validateLeadAndAssignee(ctx: AuthContext, leadId: string, assignedToId?: string | null) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: ctx.organizationId },
  });

  if (!lead) throw new Error("Lead not found");

  if (assignedToId) {
    const assignee = await prisma.user.findFirst({
      where: { id: assignedToId, organizationId: ctx.organizationId },
    });

    if (!assignee) throw new Error("Assigned user not found");
  }
}

export async function createTask(ctx: AuthContext, input: TaskInput) {
  assertCanManageTask(ctx, input.assignedToId);
  await validateLeadAndAssignee(ctx, input.leadId, input.assignedToId);

  const task = await prisma.task.create({
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

  await createActivity({
    type: ActivityType.TASK_CREATED,
    message: `Task "${task.title}" created for lead ${task.lead.name}`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    taskId: task.id,
    leadId: task.leadId,
  });

  if (task.assignedToId) {
    await createActivity({
      type: ActivityType.TASK_ASSIGNED,
      message: `Task "${task.title}" assigned to ${task.assignedTo?.name ?? "team member"}`,
      actorId: ctx.userId,
      organizationId: ctx.organizationId,
      taskId: task.id,
      leadId: task.leadId,
    });

    await createNotification({
      title: "New Task Assignment",
      body: `You were assigned task: ${task.title}`,
      organizationId: ctx.organizationId,
      recipientId: task.assignedToId,
      type: NotificationType.TASK_ASSIGNED,
    });
  }

  return task;
}

function buildTaskWhere(ctx: AuthContext, filters: TaskFilters): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {
    organizationId: ctx.organizationId,
    ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
  };

  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedToId && ctx.role !== "AGENT") where.assignedToId = filters.assignedToId;

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { lead: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const now = new Date();
  const start = filters.date ? new Date(filters.date) : startOfToday();
  const end = filters.date ? new Date(filters.date) : endOfToday();
  if (filters.date) end.setHours(23, 59, 59, 999);

  if (filters.view === "today") {
    where.dueDate = { gte: start, lte: end };
    where.status = { not: TaskStatus.COMPLETED };
  }

  if (filters.view === "upcoming") {
    where.dueDate = { gt: endOfToday() };
    where.status = { not: TaskStatus.COMPLETED };
  }

  if (filters.view === "overdue") {
    where.dueDate = { lt: now };
    where.status = { not: TaskStatus.COMPLETED };
  }

  if (filters.view === "completed") {
    where.status = TaskStatus.COMPLETED;
  }

  return where;
}

export async function listTasks(ctx: AuthContext, filters: TaskFilters = {}) {
  const tasks = await prisma.task.findMany({
    where: buildTaskWhere(ctx, filters),
    include: {
      lead: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  const now = new Date();

  return tasks.map((task) => {
    const dynamicOverdue = task.status !== TaskStatus.COMPLETED && task.dueDate < now;

    return {
      ...task,
      isOverdue: dynamicOverdue || task.isOverdue,
      category:
        task.status === TaskStatus.COMPLETED
          ? "completed"
          : task.dueDate < now
            ? "overdue"
            : task.dueDate <= endOfToday()
              ? "today"
              : "upcoming",
    };
  });
}

export async function updateTask(ctx: AuthContext, taskId: string, updates: Partial<TaskInput> & { markComplete?: boolean }) {
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
    },
    include: {
      assignedTo: true,
      lead: true,
    },
  });

  if (!existing) throw new Error("Task not found");

  if (updates.assignedToId !== undefined) {
    assertCanManageTask(ctx, updates.assignedToId);
    await validateLeadAndAssignee(ctx, existing.leadId, updates.assignedToId);
  }

  const status = updates.markComplete ? TaskStatus.COMPLETED : updates.status ?? existing.status;
  const dueDate = updates.dueDate ?? existing.dueDate;

  const task = await prisma.task.update({
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

  await createActivity({
    type: status === TaskStatus.COMPLETED ? ActivityType.TASK_COMPLETED : ActivityType.TASK_UPDATED,
    message:
      status === TaskStatus.COMPLETED
        ? `Task "${task.title}" marked completed`
        : `Task "${task.title}" updated`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    taskId: task.id,
    leadId: task.leadId,
  });

  if (status === TaskStatus.COMPLETED) {
    await runAutomation("TASK_COMPLETED", { ...ctx, leadId: task.leadId }, { status: task.status });
  }

  if (updates.assignedToId && updates.assignedToId !== existing.assignedToId) {
    await createActivity({
      type: ActivityType.TASK_ASSIGNED,
      message: `Task "${task.title}" reassigned to ${task.assignedTo?.name ?? "team member"}`,
      actorId: ctx.userId,
      organizationId: ctx.organizationId,
      taskId: task.id,
      leadId: task.leadId,
    });

    await createNotification({
      title: "Task Reassigned",
      body: `You were assigned task: ${task.title}`,
      organizationId: ctx.organizationId,
      recipientId: updates.assignedToId,
      type: NotificationType.TASK_ASSIGNED,
    });
  }

  return task;
}

export async function deleteTask(ctx: AuthContext, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { createdById: ctx.userId } : {}),
    },
  });

  if (!existing) throw new Error("Task not found");

  await prisma.task.delete({ where: { id: taskId } });

  await createActivity({
    type: ActivityType.TASK_UPDATED,
    message: `Task "${existing.title}" deleted`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    taskId,
    leadId: existing.leadId,
  });

  return { success: true };
}

export async function markOverdueTasks(organizationId?: string) {
  const where: Prisma.TaskWhereInput = {
    status: { not: TaskStatus.COMPLETED },
    dueDate: { lt: new Date() },
    isOverdue: false,
    ...(organizationId ? { organizationId } : {}),
  };

  const result = await prisma.task.updateMany({
    where,
    data: { isOverdue: true },
  });

  return result.count;
}

export async function triggerTaskReminders(organizationId?: string, actorId?: string) {
  const now = new Date();
  const tasks = await prisma.task.findMany({
    where: {
      reminderTime: { lte: now },
      status: { not: TaskStatus.COMPLETED },
      ...(organizationId ? { organizationId } : {}),
    },
    include: {
      assignedTo: true,
      lead: true,
    },
    take: 100,
  });

  if (!tasks.length) return 0;

  await prisma.$transaction(
    tasks.flatMap((task) => {
      const actions: Prisma.PrismaPromise<unknown>[] = [
        prisma.task.update({
          where: { id: task.id },
          data: { reminderTime: null },
        }),
      ];

      if (task.assignedToId) {
        actions.push(
          prisma.notification.create({
            data: {
              title: "Task Reminder",
              body: `Reminder: ${task.title} (Lead: ${task.lead.name})`,
              organizationId: task.organizationId,
              recipientId: task.assignedToId,
              type: NotificationType.TASK_REMINDER,
            },
          }),
        );
      }

      return actions;
    }),
  );

  if (organizationId && actorId) {
    await runTimeBasedAutomations(organizationId, actorId);
  }

  return tasks.length;
}
