import { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/db";

type CreateActivityInput = {
  type: ActivityType;
  message: string;
  organizationId: string;
  actorId?: string;
  leadId?: string;
  taskId?: string;
};

export async function createActivity(input: CreateActivityInput) {
  return prisma.activity.create({
    data: input,
  });
}

