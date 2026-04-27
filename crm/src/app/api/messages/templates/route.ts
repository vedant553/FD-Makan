import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { badRequest, ok, serverError } from "@/lib/api-response";
import { getAuthContext } from "@/lib/services/auth-context";

const templateSchema = z.object({
  name: z.string().min(2),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP"]),
  content: z.string().min(1),
});

export async function GET() {
  try {
    const ctx = await getAuthContext();
    const templates = await prisma.messageTemplate.findMany({
      where: { organizationId: ctx.organizationId },
      orderBy: { createdAt: "desc" },
    });
    return ok({ templates });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const parsed = templateSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message).join(", "));

    const template = await prisma.messageTemplate.create({
      data: {
        ...parsed.data,
        organizationId: ctx.organizationId,
      },
    });

    return ok({ template }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
