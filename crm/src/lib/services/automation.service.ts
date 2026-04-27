import { prisma } from "@/lib/db";
import type { AuthContext } from "@/lib/services/types";
import { sendMessage } from "@/lib/services/message.service";
import { AutomationActionType, AutomationTriggerType, TaskPriority, TaskStatus } from "@prisma/client";

type AutomationContext = AuthContext & {
  leadId?: string;
};

function conditionPasses(condition: unknown, payload: { leadId?: string; status?: string }) {
  if (!condition || typeof condition !== "object") return true;
  const c = condition as Record<string, unknown>;
  if (typeof c.leadStatusEquals === "string" && c.leadStatusEquals !== payload.status) return false;
  return true;
}

export async function runAutomation(triggerType: AutomationTriggerType, ctx: AutomationContext, payload: Record<string, unknown>) {
  const rules = await prisma.automationRule.findMany({
    where: { organizationId: ctx.organizationId, triggerType, isActive: true },
  });

  for (const rule of rules) {
    if (!conditionPasses(rule.condition, payload as { status?: string })) continue;

    const config = (rule.config as Record<string, unknown>) || {};

    if (rule.actionType === AutomationActionType.CREATE_TASK && ctx.leadId) {
      await prisma.task.create({
        data: {
          title: String(config.title ?? "Automated follow-up"),
          description: String(config.description ?? "Created by automation rule."),
          leadId: ctx.leadId,
          assignedToId: typeof config.assignedToId === "string" ? config.assignedToId : ctx.userId,
          createdById: ctx.userId,
          priority: (config.priority as TaskPriority) ?? TaskPriority.MEDIUM,
          status: TaskStatus.PENDING,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          reminderTime: new Date(Date.now() + 23 * 60 * 60 * 1000),
          organizationId: ctx.organizationId,
        },
      });
    }

    if (rule.actionType === AutomationActionType.SEND_MESSAGE && ctx.leadId) {
      await sendMessage(ctx, {
        leadId: ctx.leadId,
        channel: (config.channel as "EMAIL" | "SMS" | "WHATSAPP") ?? "WHATSAPP",
        content: String(config.content ?? "Automated follow-up from CRM"),
      });
    }

    if (rule.actionType === AutomationActionType.ASSIGN_LEAD && ctx.leadId && typeof config.assignedToId === "string") {
      await prisma.lead.updateMany({
        where: { id: ctx.leadId, organizationId: ctx.organizationId },
        data: { assignedToId: config.assignedToId },
      });
    }
  }
}

export async function runTimeBasedAutomations(organizationId: string, actorId: string) {
  const ctx: AuthContext = { organizationId, userId: actorId, role: "ADMIN" };
  await runAutomation("TIME_BASED", ctx, {});
  return { ok: true };
}
