import { TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { AuthContext } from "@/lib/services/types";
import { endOfToday, startOfToday } from "@/lib/utils";

export async function getDashboardStats(ctx: AuthContext) {
  const baseTaskWhere = {
    organizationId: ctx.organizationId,
    ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
  };

  const baseLeadWhere = {
    organizationId: ctx.organizationId,
    ...(ctx.role === "AGENT" ? { assignedToId: ctx.userId } : {}),
  };

  const [tasksDueToday, overdueTasks, leadsCount, totalTasks, completedTasks, recentActivities] =
    await Promise.all([
      prisma.task.count({
        where: {
          ...baseTaskWhere,
          dueDate: {
            gte: startOfToday(),
            lte: endOfToday(),
          },
          status: { not: TaskStatus.COMPLETED },
        },
      }),
      prisma.task.count({
        where: {
          ...baseTaskWhere,
          dueDate: { lt: new Date() },
          status: { not: TaskStatus.COMPLETED },
        },
      }),
      prisma.lead.count({ where: baseLeadWhere }),
      prisma.task.count({ where: baseTaskWhere }),
      prisma.task.count({ where: { ...baseTaskWhere, status: TaskStatus.COMPLETED } }),
      prisma.activity.findMany({
        where: {
          organizationId: ctx.organizationId,
        },
        include: {
          actor: { select: { name: true } },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      }),
    ]);

  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    tasksDueToday,
    overdueTasks,
    leadsCount,
    completionRate,
    recentActivities,
  };
}

