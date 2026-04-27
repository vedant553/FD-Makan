import { NotificationType } from "@prisma/client";

import { prisma } from "@/lib/db";

type CreateNotificationInput = {
  title: string;
  body: string;
  organizationId: string;
  type?: NotificationType;
  recipientId?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      title: input.title,
      body: input.body,
      organizationId: input.organizationId,
      type: input.type ?? NotificationType.GENERAL,
      recipientId: input.recipientId,
    },
  });
}

export async function getNotifications(organizationId: string, recipientId?: string) {
  return prisma.notification.findMany({
    where: {
      organizationId,
      ...(recipientId ? { recipientId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}

