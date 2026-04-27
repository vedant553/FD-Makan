import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, code = "BAD_REQUEST") {
  return NextResponse.json({ message, code }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ message, code: "UNAUTHORIZED" }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ message, code: "FORBIDDEN" }, { status: 403 });
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";

  if (message === "Unauthorized") return unauthorized(message);
  if (message === "Forbidden") return forbidden(message);
  if (message.toLowerCase().includes("not found")) {
    return NextResponse.json({ message, code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ message, code: "INTERNAL_SERVER_ERROR" }, { status: 500 });
}


