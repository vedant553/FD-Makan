import { ActivityType, DealStatus, PaymentStatus, PropertyStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createActivity } from "@/lib/services/activity.service";
import type { AuthContext } from "@/lib/services/types";

type CreateDealInput = {
  leadId: string;
  propertyId: string;
  value: number;
  status?: DealStatus;
};

type CreatePaymentInput = {
  dealId: string;
  amount: number;
  status?: PaymentStatus;
  date?: Date;
};

export async function createDeal(ctx: AuthContext, input: CreateDealInput) {
  const [lead, property] = await Promise.all([
    prisma.lead.findFirst({ where: { id: input.leadId, organizationId: ctx.organizationId } }),
    prisma.property.findFirst({ where: { id: input.propertyId, organizationId: ctx.organizationId } }),
  ]);

  if (!lead) throw new Error("Lead not found");
  if (!property) throw new Error("Property not found");

  const deal = await prisma.deal.create({
    data: {
      leadId: input.leadId,
      propertyId: input.propertyId,
      value: input.value,
      status: input.status ?? DealStatus.OPEN,
      organizationId: ctx.organizationId,
    },
  });

  if (input.status === DealStatus.WON || input.status === DealStatus.CLOSED) {
    await prisma.property.update({ where: { id: property.id }, data: { status: PropertyStatus.SOLD } });
  }

  await createActivity({
    type: ActivityType.DEAL_CREATED,
    message: `Deal created for ${lead.name} worth ${input.value}`,
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    leadId: lead.id,
  });

  return deal;
}

export async function createPayment(ctx: AuthContext, input: CreatePaymentInput) {
  const deal = await prisma.deal.findFirst({ where: { id: input.dealId, organizationId: ctx.organizationId } });
  if (!deal) throw new Error("Deal not found");

  const payment = await prisma.payment.create({
    data: {
      dealId: input.dealId,
      amount: input.amount,
      status: input.status ?? PaymentStatus.PENDING,
      date: input.date ?? new Date(),
      organizationId: ctx.organizationId,
    },
  });

  const received = await prisma.payment.aggregate({
    where: { dealId: deal.id, organizationId: ctx.organizationId, status: PaymentStatus.RECEIVED },
    _sum: { amount: true },
  });

  if ((received._sum.amount ?? 0) >= deal.value) {
    await prisma.deal.update({ where: { id: deal.id }, data: { status: DealStatus.CLOSED, closedAt: new Date() } });
  }

  await createActivity({
    type: ActivityType.PAYMENT_RECORDED,
    message: `Payment of ${input.amount} recorded for deal ${deal.id}`,
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    leadId: deal.leadId,
  });

  return payment;
}

export async function listDeals(ctx: AuthContext) {
  return prisma.deal.findMany({
    where: { organizationId: ctx.organizationId },
    include: {
      lead: { select: { id: true, name: true } },
      property: { select: { id: true, name: true, location: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
