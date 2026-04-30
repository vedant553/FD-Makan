export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
};

type AuthInterceptor = (payload: { status: 401 | 403; url: string }) => void;

let authInterceptor: AuthInterceptor | null = null;

export function setApiAuthInterceptor(handler: AuthInterceptor | null) {
  authInterceptor = handler;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ApiClientError("Request timed out", "TIMEOUT"));
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function shouldRetry(method: string, status?: number, attempt = 0, retries = 0) {
  if (method !== "GET") return false;
  if (attempt >= retries) return false;
  if (!status) return true;
  return status >= 500 || status === 429;
}

function normalizeError(status: number, payload: unknown): ApiClientError {
  const body = (payload ?? {}) as Record<string, unknown>;
  const message = typeof body.message === "string" ? body.message : `Request failed with status ${status}`;
  const code = typeof body.code === "string" ? (body.code as ApiErrorCode) : "INTERNAL_SERVER_ERROR";
  return new ApiClientError(message, code, status, payload);
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    timeoutMs = 12000,
    retries = 1,
    headers,
    method = "GET",
    ...rest
  } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  let attempt = 0;
  while (true) {
    try {
      const res = await withTimeout(
        fetch(url, {
          method,
          headers: finalHeaders,
          body: body === undefined ? undefined : JSON.stringify(body),
          ...rest,
        }),
        timeoutMs,
      );

      const contentType = res.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json") ? await res.json() : await res.text();

      if (!res.ok) {
        if ((res.status === 401 || res.status === 403) && authInterceptor) {
          authInterceptor({ status: res.status as 401 | 403, url });
        }
        if (shouldRetry(method, res.status, attempt, retries)) {
          attempt += 1;
          continue;
        }
        throw normalizeError(res.status, payload);
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (shouldRetry(method, error.status, attempt, retries)) {
          attempt += 1;
          continue;
        }
        throw error;
      }

      if (shouldRetry(method, undefined, attempt, retries)) {
        attempt += 1;
        continue;
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : "Network request failed",
        "NETWORK_ERROR",
      );
    }
  }
}
