import { CampaignSource, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createLead } from "@/lib/services/lead.service";
import type { AuthContext } from "@/lib/services/types";

export async function pullIntegrationLeads(
  ctx: AuthContext,
  provider: "facebook_ads" | "google_ads" | "whatsapp",
  payload: Record<string, unknown>,
) {
  await prisma.integrationEvent.create({
    data: {
      provider,
      eventType: "LEAD_SYNC",
      payload: payload as Prisma.InputJsonValue,
      status: "RECEIVED",
      organizationId: ctx.organizationId,
    },
  });

  const sourceMap: Record<string, CampaignSource> = {
    facebook_ads: CampaignSource.FACEBOOK,
    google_ads: CampaignSource.GOOGLE,
    whatsapp: CampaignSource.WHATSAPP,
  };

  const lead = await createLead(ctx, {
    name: String(payload.name ?? `${provider} lead`),
    phone: String(payload.phone ?? `+000${Date.now().toString().slice(-8)}`),
    email: typeof payload.email === "string" ? payload.email : null,
    source: sourceMap[provider],
    status: "NEW",
  });

  await prisma.integrationEvent.create({
    data: {
      provider,
      eventType: "LEAD_SYNC",
      payload: { leadId: lead.id } as Prisma.InputJsonValue,
      status: "COMPLETED",
      organizationId: ctx.organizationId,
    },
  });

  return lead;
}
