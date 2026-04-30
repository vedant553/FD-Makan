import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export class TasksDomainError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "BAD_REQUEST"
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "CONFLICT"
      | "INTERNAL_SERVER_ERROR" = "BAD_REQUEST",
    public readonly status = 400,
  ) {
    super(message);
    this.name = "TasksDomainError";
  }
}

export function tasksOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function tasksErrorResponse(error: unknown) {
  if (error instanceof TasksDomainError) {
    return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
  }

  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: error.message, code: "UNAUTHORIZED" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ message: error.message, code: "FORBIDDEN" }, { status: 403 });
    }
  }

  return NextResponse.json(
    { message: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
    { status: 500 },
  );
}

export async function parseDomainBody<T>(schema: ZodType<T>, req: Request): Promise<T> {
  const payload = await req.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new TasksDomainError(parsed.error.issues.map((issue) => issue.message).join(", "), "BAD_REQUEST", 400);
  }
  return parsed.data;
}

export function parseDomainQuery<T>(schema: ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new TasksDomainError(parsed.error.issues.map((issue) => issue.message).join(", "), "BAD_REQUEST", 400);
  }
  return parsed.data;
}
