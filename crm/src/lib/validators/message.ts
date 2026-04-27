import { MessageChannel } from "@prisma/client";
import { z } from "zod";

export const sendMessageSchema = z.object({
  leadId: z.string().optional(),
  channel: z.nativeEnum(MessageChannel),
  content: z.string().min(1),
  templateId: z.string().optional(),
});

export const bulkMessageSchema = z.object({
  leadIds: z.array(z.string()).min(1),
  channel: z.nativeEnum(MessageChannel),
  content: z.string().min(1),
  templateId: z.string().optional(),
});
