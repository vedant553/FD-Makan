import { NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { badRequest, ok, serverError } from "@/lib/api-response";
import { signupSchema } from "@/lib/validators/auth";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const { email, password, name, organizationName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return badRequest("Email already registered", "EMAIL_EXISTS");

    const organization = await prisma.organization.create({ data: { name: organizationName } });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 10),
        role: "ADMIN",
        organizationId: organization.id,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return ok({ user, organizationId: organization.id }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}


