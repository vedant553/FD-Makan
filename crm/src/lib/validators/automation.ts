import { AutomationActionType, AutomationTriggerType } from "@prisma/client";
import { z } from "zod";

export const automationRuleSchema = z.object({
  name: z.string().min(2),
  triggerType: z.nativeEnum(AutomationTriggerType),
  condition: z.record(z.string(), z.any()).optional(),
  actionType: z.nativeEnum(AutomationActionType),
  config: z.record(z.string(), z.any()),
  isActive: z.boolean().optional(),
});

export const integrationPullSchema = z.object({
  provider: z.enum(["facebook_ads", "google_ads", "whatsapp"]),
  payload: z.record(z.string(), z.any()).default({}),
});
