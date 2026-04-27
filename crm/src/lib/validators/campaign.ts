import { CampaignSource } from "@prisma/client";
import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(2),
  source: z.nativeEnum(CampaignSource),
  budget: z.number().nonnegative(),
  spent: z.number().nonnegative().optional(),
});
