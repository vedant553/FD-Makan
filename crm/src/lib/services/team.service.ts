import { AttendanceStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { AuthContext } from "@/lib/services/types";

export async function markAttendance(
  ctx: AuthContext,
  input: { userId: string; date?: Date; status: AttendanceStatus; checkIn?: Date; checkOut?: Date },
) {
  return prisma.attendance.create({
    data: {
      userId: input.userId,
      date: input.date ?? new Date(),
      status: input.status,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      organizationId: ctx.organizationId,
    },
  });
}

export async function listAttendance(ctx: AuthContext) {
  return prisma.attendance.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(ctx.role === "AGENT" ? { userId: ctx.userId } : {}),
    },
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { date: "desc" },
  });
}

export async function getTeamPerformance(ctx: AuthContext) {
  const users = await prisma.user.findMany({
    where: { organizationId: ctx.organizationId },
    select: { id: true, name: true, role: true },
  });

  const records = [];
  for (const user of users) {
    const [tasksCompleted, callsMade, successfulCalls, conversions] = await Promise.all([
      prisma.task.count({ where: { organizationId: ctx.organizationId, assignedToId: user.id, status: "COMPLETED" } }),
      prisma.callLog.count({ where: { organizationId: ctx.organizationId, userId: user.id } }),
      prisma.callLog.count({ where: { organizationId: ctx.organizationId, userId: user.id, status: "CONNECTED" } }),
      prisma.lead.count({ where: { organizationId: ctx.organizationId, assignedToId: user.id, status: "CLOSED" } }),
    ]);

    records.push({
      ...user,
      tasksCompleted,
      callsMade,
      successfulCalls,
      conversions,
    });
  }

  return records;
}
