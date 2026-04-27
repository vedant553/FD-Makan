import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";
import { automationRuleSchema } from "@/lib/validators/automation";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    const rules = await prisma.automationRule.findMany({
      where: { organizationId: ctx.organizationId },
      orderBy: { createdAt: "desc" },
    });
    return ok({ rules });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = automationRuleSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const rule = await prisma.automationRule.create({
      data: {
        name: parsed.data.name,
        triggerType: parsed.data.triggerType,
        actionType: parsed.data.actionType,
        config: parsed.data.config as Prisma.InputJsonValue,
        condition: parsed.data.condition ? (parsed.data.condition as Prisma.InputJsonValue) : undefined,
        isActive: parsed.data.isActive ?? true,
        organizationId: ctx.organizationId,
      },
    });

    return ok({ rule }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
