import type { ZodType } from "zod";

import { AppError } from "@/server/core/errors";

function formatIssues(error: { issues: Array<{ path: (string | number)[]; message: string }> }) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function parseBody<T>(schema: ZodType<T>, req: Request): Promise<T> {
  const payload = await req.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError("Invalid request body", "BAD_REQUEST", 400, { issues: formatIssues(parsed.error) });
  }

  return parsed.data;
}

export function parseQuery<T>(schema: ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new AppError("Invalid query parameters", "BAD_REQUEST", 400, { issues: formatIssues(parsed.error) });
  }

  return parsed.data;
}
