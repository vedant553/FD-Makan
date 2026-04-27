import { CampaignSource } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { AuthContext } from "@/lib/services/types";

type CreateCampaignInput = {
  name: string;
  source: CampaignSource;
  budget: number;
  spent?: number;
};

export async function createCampaign(ctx: AuthContext, input: CreateCampaignInput) {
  return prisma.campaign.create({
    data: {
      name: input.name,
      source: input.source,
      budget: input.budget,
      spent: input.spent ?? 0,
      organizationId: ctx.organizationId,
    },
  });
}

export async function listCampaigns(ctx: AuthContext) {
  return prisma.campaign.findMany({
    where: { organizationId: ctx.organizationId },
    include: { _count: { select: { leads: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateCampaignDerivedStats(campaignId: string, organizationId: string) {
  const [leadsGenerated, closedDeals] = await Promise.all([
    prisma.lead.count({ where: { organizationId, campaignId } }),
    prisma.deal.aggregate({
      where: { organizationId, lead: { campaignId }, status: { in: ["WON", "CLOSED"] } },
      _sum: { value: true },
    }),
  ]);

  await prisma.campaign.updateMany({
    where: { id: campaignId, organizationId },
    data: {
      leadsGenerated,
      revenueGenerated: closedDeals._sum.value ?? 0,
    },
  });
}
