export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode = "BAD_REQUEST",
    public readonly status = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, "CONFLICT", 409);
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Error) {
    if (error.message === "Unauthorized") return new UnauthorizedError();
    if (error.message === "Forbidden") return new ForbiddenError();
    if (error.message.toLowerCase().includes("not found")) return new NotFoundError(error.message);
    return new AppError(error.message, "INTERNAL_SERVER_ERROR", 500);
  }

  return new AppError("Internal server error", "INTERNAL_SERVER_ERROR", 500);
}
