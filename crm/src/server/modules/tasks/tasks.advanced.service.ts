import { ActivityType, MessageChannel, MessageStatus, NotificationType, TaskPriority, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createActivity } from "@/lib/services/activity.service";
import { createNotification } from "@/lib/services/notification.service";
import type { AuthContext } from "@/lib/services/types";
import { TasksDomainError } from "@/server/modules/tasks/tasks.domain";
import { assignTask, createTask } from "@/server/modules/tasks/tasks.service";
import type {
  BulkAssignInput,
  FollowupSequenceInput,
  QuickActionInput,
  RecurringTaskInput,
} from "@/server/modules/tasks/tasks.advanced.validators";

export async function bulkAssignTasks(ctx: AuthContext, input: BulkAssignInput) {
  const tasks = await prisma.task.findMany({
    where: {
      id: { in: input.taskIds },
      organizationId: ctx.organizationId,
    },
    select: { id: true },
  });

  if (!tasks.length) return { updated: 0 };

  let updated = 0;
  for (const task of tasks) {
    await assignTask(ctx, task.id, input.assignedToId);
    updated += 1;
  }

  return { updated };
}

export async function getAssignmentSuggestions(ctx: AuthContext, limit = 5) {
  const users = await prisma.user.findMany({
    where: { organizationId: ctx.organizationId },
    select: { id: true, name: true, role: true },
    take: 100,
  });

  const workloads = await prisma.task.groupBy({
    by: ["assignedToId"],
    where: {
      organizationId: ctx.organizationId,
      status: { not: TaskStatus.COMPLETED },
      assignedToId: { not: null },
    },
    _count: { _all: true },
  });

  const byUser = new Map(workloads.map((w) => [w.assignedToId, w._count._all]));
  return users
    .filter((u) => u.role !== "ADMIN")
    .map((u) => ({
      userId: u.id,
      name: u.name,
      role: u.role,
      activeTaskCount: byUser.get(u.id) ?? 0,
      score: 100 - Math.min(100, (byUser.get(u.id) ?? 0) * 5),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function getUnifiedTimeline(ctx: AuthContext, leadId?: string, taskId?: string, page = 1, limit = 30) {
  const skip = (page - 1) * limit;
  const whereBase = { organizationId: ctx.organizationId };

  const [activities, calls, siteVisits, messages] = await Promise.all([
    prisma.activity.findMany({
      where: {
        ...whereBase,
        ...(leadId ? { leadId } : {}),
        ...(taskId ? { taskId } : {}),
      },
      include: { actor: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.callLog.findMany({
      where: {
        ...whereBase,
        ...(leadId ? { leadId } : {}),
      },
      select: { id: true, leadId: true, notes: true, status: true, duration: true, createdAt: true, userId: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.siteVisit.findMany({
      where: {
        ...whereBase,
        ...(leadId ? { leadId } : {}),
      },
      select: { id: true, leadId: true, status: true, notes: true, scheduledAt: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }),
    prisma.message.findMany({
      where: {
        ...whereBase,
        ...(leadId ? { leadId } : {}),
      },
      select: { id: true, leadId: true, channel: true, content: true, status: true, createdAt: true, createdById: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  const items = [
    ...activities.map((a) => ({
      source: "activity",
      id: a.id,
      leadId: a.leadId,
      taskId: a.taskId,
      type: a.type,
      message: a.message,
      actor: a.actor?.name ?? null,
      occurredAt: a.createdAt,
    })),
    ...calls.map((c) => ({
      source: "call",
      id: c.id,
      leadId: c.leadId,
      type: "CALL_LOGGED",
      message: c.notes ?? `Call ${c.status} (${c.duration}s)`,
      actorId: c.userId,
      occurredAt: c.createdAt,
    })),
    ...siteVisits.map((s) => ({
      source: "siteVisit",
      id: s.id,
      leadId: s.leadId,
      type: "SITE_VISIT_UPDATED",
      message: `Site visit ${s.status}${s.notes ? `: ${s.notes}` : ""}`,
      occurredAt: s.updatedAt,
    })),
    ...messages.map((m) => ({
      source: "message",
      id: m.id,
      leadId: m.leadId,
      type: "MESSAGE_SENT",
      message: `${m.channel}: ${m.content}`,
      occurredAt: m.createdAt,
    })),
  ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  return { items: items.slice(0, limit), pagination: { page, limit } };
}

export async function createQuickActionEntry(ctx: AuthContext, input: QuickActionInput) {
  const lead = await prisma.lead.findFirst({
    where: { id: input.leadId, organizationId: ctx.organizationId },
  });
  if (!lead) throw new TasksDomainError("Lead not found", "NOT_FOUND", 404);

  if (input.action === "NOTE") {
    const activity = await createActivity({
      type: ActivityType.TASK_UPDATED,
      message: `Note added: ${input.content}`,
      actorId: ctx.userId,
      organizationId: ctx.organizationId,
      leadId: input.leadId,
      taskId: input.taskId,
    });
    return { source: "activity", id: activity.id };
  }

  if (input.action === "CALL") {
    const call = await prisma.callLog.create({
      data: {
        phone: input.phone ?? lead.phone,
        leadId: input.leadId,
        userId: ctx.userId,
        status: "CONNECTED",
        notes: input.content,
        duration: 0,
        organizationId: ctx.organizationId,
      },
    });
    return { source: "call", id: call.id };
  }

  const channel: MessageChannel =
    input.action === "WA" ? "WHATSAPP" : input.action === "SMS" ? "SMS" : "EMAIL";
  const message = await prisma.message.create({
    data: {
      leadId: input.leadId,
      templateId: input.templateId,
      channel,
      content: input.content,
      status: MessageStatus.SENT,
      sentAt: new Date(),
      createdById: ctx.userId,
      organizationId: ctx.organizationId,
    },
  });

  await createActivity({
    type: ActivityType.MESSAGE_SENT,
    message: `${channel} sent`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    leadId: input.leadId,
    taskId: input.taskId,
  });

  return { source: "message", id: message.id };
}

export async function createRecurringTasks(ctx: AuthContext, input: RecurringTaskInput) {
  const created = [];
  for (let i = 0; i < input.occurrences; i += 1) {
    const dueDate = new Date(input.firstDueDate);
    dueDate.setDate(dueDate.getDate() + i * input.intervalDays);
    const task = await createTask(ctx, {
      title: `${input.title} (${i + 1}/${input.occurrences})`,
      description: input.description ?? null,
      leadId: input.leadId,
      assignedToId: input.assignedToId ?? null,
      priority: input.priority as TaskPriority,
      status: TaskStatus.PENDING,
      dueDate,
      reminderTime: null,
    });
    created.push(task.id);
  }

  return { createdCount: created.length, taskIds: created };
}

export async function createFollowupSequence(ctx: AuthContext, input: FollowupSequenceInput) {
  const base = new Date();
  const created = [];

  for (const step of input.steps) {
    const dueDate = new Date(base.getTime() + step.offsetHours * 60 * 60 * 1000);
    const task = await createTask(ctx, {
      title: step.title,
      description: step.description ?? null,
      leadId: input.leadId,
      assignedToId: input.assignedToId ?? null,
      priority: step.priority as TaskPriority,
      status: TaskStatus.PENDING,
      dueDate,
      reminderTime: null,
    });
    created.push({ taskId: task.id, dueDate });
  }

  return { createdCount: created.length, tasks: created };
}

export async function getSlaIndicators(ctx: AuthContext, dateFrom?: Date, dateTo?: Date, assigneeId?: string) {
  const where = {
    organizationId: ctx.organizationId,
    ...(assigneeId ? { assignedToId: assigneeId } : {}),
    ...(ctx.role === "AGENT" ? { OR: [{ assignedToId: ctx.userId }, { createdById: ctx.userId }] } : {}),
    ...(dateFrom || dateTo
      ? {
          dueDate: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
  };

  const tasks = await prisma.task.findMany({
    where,
    select: { id: true, status: true, dueDate: true, updatedAt: true, isOverdue: true },
  });

  const now = new Date();
  const overdue = tasks.filter((t) => t.status !== TaskStatus.COMPLETED && t.dueDate < now).length;
  const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const agingBuckets = {
    d0_1: 0,
    d2_3: 0,
    d4_7: 0,
    d8_plus: 0,
  };

  for (const task of tasks) {
    if (task.status === TaskStatus.COMPLETED) continue;
    const ageDays = Math.floor((now.getTime() - task.dueDate.getTime()) / (24 * 3600 * 1000));
    if (ageDays <= 1) agingBuckets.d0_1 += 1;
    else if (ageDays <= 3) agingBuckets.d2_3 += 1;
    else if (ageDays <= 7) agingBuckets.d4_7 += 1;
    else agingBuckets.d8_plus += 1;
  }

  return {
    total: tasks.length,
    overdue,
    completed,
    completionRate,
    agingBuckets,
  };
}

export async function runReminderEngine(ctx: AuthContext, preDueWindowMinutes = 30) {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + preDueWindowMinutes * 60 * 1000);

  const preDueTasks = await prisma.task.findMany({
    where: {
      organizationId: ctx.organizationId,
      status: { not: TaskStatus.COMPLETED },
      dueDate: { gte: now, lte: windowEnd },
      assignedToId: { not: null },
    },
    include: { lead: { select: { name: true } } },
    take: 200,
  });

  const overdueTasks = await prisma.task.findMany({
    where: {
      organizationId: ctx.organizationId,
      status: { not: TaskStatus.COMPLETED },
      dueDate: { lt: now },
      isOverdue: false,
    },
    include: { lead: { select: { name: true } } },
    take: 200,
  });

  for (const task of preDueTasks) {
    await createNotification({
      title: "Task Due Soon",
      body: `${task.title} is due soon (Lead: ${task.lead.name})`,
      organizationId: task.organizationId,
      recipientId: task.assignedToId ?? undefined,
      type: NotificationType.TASK_REMINDER,
    });
    await createActivity({
      type: ActivityType.TASK_UPDATED,
      message: `Pre-due reminder triggered for "${task.title}"`,
      actorId: ctx.userId,
      organizationId: ctx.organizationId,
      taskId: task.id,
      leadId: task.leadId,
    });
  }

  for (const task of overdueTasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: { isOverdue: true },
    });
    await createNotification({
      title: "Task Overdue Escalation",
      body: `Task overdue: ${task.title} (Lead: ${task.lead.name})`,
      organizationId: task.organizationId,
      recipientId: task.createdById,
      type: NotificationType.GENERAL,
    });
    await createActivity({
      type: ActivityType.TASK_UPDATED,
      message: `Overdue escalation triggered for "${task.title}"`,
      actorId: ctx.userId,
      organizationId: ctx.organizationId,
      taskId: task.id,
      leadId: task.leadId,
    });
  }

  return {
    preDueReminders: preDueTasks.length,
    overdueEscalations: overdueTasks.length,
  };
}
