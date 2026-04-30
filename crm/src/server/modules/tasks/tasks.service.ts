import { ActivityType, NotificationType, TaskStatus } from "@prisma/client";

import { createActivity } from "@/lib/services/activity.service";
import { createNotification } from "@/lib/services/notification.service";
import { runAutomation } from "@/lib/services/automation.service";
import type { AuthContext } from "@/lib/services/types";
import { endOfToday } from "@/lib/utils";
import { TasksDomainError } from "@/server/modules/tasks/tasks.domain";
import { assertTaskAction, assertTaskAssigneeAccess } from "@/server/modules/tasks/tasks.auth";
import { logTaskEvent } from "@/server/modules/tasks/tasks.logger";
import {
  createTaskRecord,
  deleteTaskRecord,
  findTaskById,
  findTaskForDelete,
  findTaskLeadAndAssignee,
  listTaskRecords,
  updateTaskRecord,
} from "@/server/modules/tasks/tasks.repository";
import type { CreateTaskInput, TaskFilterInput, UpdateTaskInput } from "@/server/modules/tasks/tasks.validators";

export async function createTask(ctx: AuthContext, input: CreateTaskInput) {
  assertTaskAction(ctx, "create");
  assertTaskAssigneeAccess(ctx, input.assignedToId);

  const { lead, assignee } = await findTaskLeadAndAssignee(ctx, input.leadId, input.assignedToId);
  if (!lead) throw new TasksDomainError("Lead not found", "NOT_FOUND", 404);
  if (input.assignedToId && !assignee) throw new TasksDomainError("Assigned user not found", "NOT_FOUND", 404);

  const task = await createTaskRecord(ctx, input);

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

  logTaskEvent("info", "TASK_CREATED", ctx, { taskId: task.id, leadId: task.leadId, assignedToId: task.assignedToId });
  return task;
}

export async function listTasks(ctx: AuthContext, filters: TaskFilterInput) {
  const { items, total } = await listTaskRecords(ctx, filters);
  const now = new Date();
  const filteredByType = items.filter((task) => {
    if (!filters.activityType && !filters.type) return true;
    const hint = `${task.title} ${task.description ?? ""}`.toLowerCase();
    const typeVal = filters.type?.toLowerCase();
    const activityVal = filters.activityType?.toLowerCase();
    return Boolean((typeVal && hint.includes(typeVal)) || (activityVal && hint.includes(activityVal)));
  });

  const tasks = filteredByType.map((task) => ({
    ...task,
    isOverdue: task.status !== TaskStatus.COMPLETED && (task.dueDate < now || task.isOverdue),
    category:
      task.status === TaskStatus.COMPLETED
        ? "completed"
        : task.dueDate < now
          ? "overdue"
          : task.dueDate <= endOfToday()
            ? "today"
            : "upcoming",
  }));

  return {
    items: tasks,
    pagination: {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      total,
      totalPages: Math.ceil(total / (filters.limit ?? 20)),
    },
  };
}

export async function getTaskById(ctx: AuthContext, taskId: string) {
  const task = await findTaskById(ctx, taskId);
  if (!task) throw new TasksDomainError("Task not found", "NOT_FOUND", 404);
  return task;
}

export async function updateTask(ctx: AuthContext, taskId: string, updates: UpdateTaskInput) {
  assertTaskAction(ctx, updates.markComplete ? "complete" : "update");
  const existing = await findTaskById(ctx, taskId);
  if (!existing) throw new TasksDomainError("Task not found", "NOT_FOUND", 404);

  if (updates.assignedToId !== undefined) {
    assertTaskAction(ctx, existing.assignedToId ? "reassign" : "assign");
    assertTaskAssigneeAccess(ctx, updates.assignedToId);
    const { assignee } = await findTaskLeadAndAssignee(ctx, existing.leadId, updates.assignedToId);
    if (updates.assignedToId && !assignee) throw new TasksDomainError("Assigned user not found", "NOT_FOUND", 404);
  }

  const status = updates.markComplete ? TaskStatus.COMPLETED : updates.status ?? existing.status;
  const dueDate = updates.dueDate ?? existing.dueDate;
  const task = await updateTaskRecord(taskId, updates, status, dueDate);

  await createActivity({
    type: status === TaskStatus.COMPLETED ? ActivityType.TASK_COMPLETED : ActivityType.TASK_UPDATED,
    message: status === TaskStatus.COMPLETED ? `Task "${task.title}" marked completed` : `Task "${task.title}" updated`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    taskId: task.id,
    leadId: task.leadId,
  });

  if (updates.status && updates.status !== existing.status && updates.status !== TaskStatus.COMPLETED) {
    await createActivity({
      type: ActivityType.TASK_UPDATED,
      message: `Task "${task.title}" status changed from ${existing.status} to ${updates.status}`,
      actorId: ctx.userId,
      organizationId: ctx.organizationId,
      taskId: task.id,
      leadId: task.leadId,
    });
  }

  if (status === TaskStatus.COMPLETED) {
    await runAutomation("TASK_COMPLETED", { ...ctx, leadId: task.leadId }, { status: task.status });
    logTaskEvent("info", "TASK_COMPLETED", ctx, { taskId: task.id, leadId: task.leadId });
  } else {
    logTaskEvent("info", "TASK_UPDATED", ctx, { taskId: task.id, leadId: task.leadId });
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

    logTaskEvent("info", "TASK_ASSIGNED", ctx, {
      taskId: task.id,
      leadId: task.leadId,
      previousAssignedToId: existing.assignedToId,
      assignedToId: updates.assignedToId,
    });
  }

  return task;
}

export async function deleteTask(ctx: AuthContext, taskId: string) {
  assertTaskAction(ctx, "delete");
  const existing = await findTaskForDelete(ctx, taskId);
  if (!existing) throw new TasksDomainError("Task not found", "NOT_FOUND", 404);

  await deleteTaskRecord(taskId);

  await createActivity({
    type: ActivityType.TASK_UPDATED,
    message: `Task "${existing.title}" deleted`,
    actorId: ctx.userId,
    organizationId: ctx.organizationId,
    taskId,
    leadId: existing.leadId,
  });

  logTaskEvent("info", "TASK_DELETED", ctx, { taskId, leadId: existing.leadId });
  return { success: true };
}

export async function completeTask(ctx: AuthContext, taskId: string) {
  return updateTask(ctx, taskId, { markComplete: true });
}

export async function assignTask(ctx: AuthContext, taskId: string, assignedToId: string) {
  return updateTask(ctx, taskId, { assignedToId });
}
