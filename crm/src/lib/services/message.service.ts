import { ActivityType, MessageChannel, MessageStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createActivity } from "@/lib/services/activity.service";
import type { AuthContext } from "@/lib/services/types";

type SendMessageInput = {
  leadId?: string;
  channel: MessageChannel;
  content: string;
  templateId?: string;
};

function simulateStatus(channel: MessageChannel): MessageStatus {
  if (channel === "EMAIL") return MessageStatus.SENT;
  return Math.random() > 0.05 ? MessageStatus.SENT : MessageStatus.FAILED;
}

export async function sendMessage(ctx: AuthContext, input: SendMessageInput) {
  if (input.leadId) {
    const lead = await prisma.lead.findFirst({ where: { id: input.leadId, organizationId: ctx.organizationId } });
    if (!lead) throw new Error("Lead not found");
  }

  const status = simulateStatus(input.channel);

  const message = await prisma.message.create({
    data: {
      leadId: input.leadId,
      channel: input.channel,
      content: input.content,
      templateId: input.templateId,
      status,
      sentAt: status === MessageStatus.SENT ? new Date() : null,
      createdById: ctx.userId,
      organizationId: ctx.organizationId,
    },
  });

  await createActivity({
    type: ActivityType.MESSAGE_SENT,
    message: `${input.channel} message ${status.toLowerCase()}${input.leadId ? " for lead" : ""}`,
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    leadId: input.leadId,
  });

  return message;
}

export async function sendBulkMessages(
  ctx: AuthContext,
  input: { leadIds: string[]; channel: MessageChannel; content: string; templateId?: string },
) {
  const leads = await prisma.lead.findMany({
    where: { id: { in: input.leadIds }, organizationId: ctx.organizationId },
    select: { id: true },
  });

  const created = [];
  for (const lead of leads) {
    created.push(
      await sendMessage(ctx, {
        leadId: lead.id,
        channel: input.channel,
        content: input.content,
        templateId: input.templateId,
      }),
    );
  }

  return created;
}
