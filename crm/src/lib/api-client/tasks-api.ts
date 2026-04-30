import { request } from "@/lib/api-client/request";
import type {
  CalendarEventDto,
  CalendarListParams,
  CreateTaskInput,
  PaginatedResponse,
  SiteVisitDto,
  SiteVisitListParams,
  TaskDto,
  TaskListParams,
  UpdateTaskInput,
} from "@/lib/api-client/tasks.types";

function withQuery(path: string, params: Record<string, unknown>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const str = qs.toString();
  return str ? `${path}?${str}` : path;
}

export const tasksApi = {
  list: (params: TaskListParams = {}) =>
    request<{ tasks: TaskDto[]; pagination: PaginatedResponse<TaskDto>["pagination"] }>(
      withQuery("/api/tasks", params),
      { method: "GET", retries: 2, cache: "no-store" },
    ),
  getById: (id: string) => request<{ task: TaskDto }>(`/api/tasks/${id}`, { method: "GET", retries: 2 }),
  create: (payload: CreateTaskInput) =>
    request<{ task: TaskDto }>("/api/tasks", { method: "POST", body: payload }),
  update: (id: string, payload: UpdateTaskInput) =>
    request<{ task: TaskDto }>(`/api/tasks/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => request<{ success: boolean }>(`/api/tasks/${id}`, { method: "DELETE" }),
  complete: (id: string) => request<{ task: TaskDto }>(`/api/tasks/${id}/complete`, { method: "PATCH" }),
  assign: (id: string, assignedToId: string) =>
    request<{ task: TaskDto }>(`/api/tasks/${id}/assign`, { method: "PATCH", body: { assignedToId } }),
};

export const siteVisitsApi = {
  list: (params: SiteVisitListParams = {}) =>
    request<{ siteVisits: SiteVisitDto[]; pagination: PaginatedResponse<SiteVisitDto>["pagination"] }>(
      withQuery("/api/site-visits", params),
      { method: "GET", retries: 2, cache: "no-store" },
    ),
  getById: (id: string) =>
    request<{ siteVisit: SiteVisitDto }>(`/api/site-visits/${id}`, { method: "GET", retries: 2 }),
  create: (payload: Omit<SiteVisitDto, "id" | "createdAt" | "updatedAt">) =>
    request<{ siteVisit: SiteVisitDto }>("/api/site-visits", { method: "POST", body: payload }),
  update: (id: string, payload: Partial<Omit<SiteVisitDto, "id" | "createdAt" | "updatedAt">>) =>
    request<{ siteVisit: SiteVisitDto }>(`/api/site-visits/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => request<{ success: boolean }>(`/api/site-visits/${id}`, { method: "DELETE" }),
  transitionStatus: (id: string, status: SiteVisitDto["status"]) =>
    request<{ siteVisit: SiteVisitDto }>(`/api/site-visits/${id}/status`, { method: "PATCH", body: { status } }),
};

export const calendarApi = {
  list: (params: CalendarListParams) =>
    request<{ events: CalendarEventDto[]; pagination: PaginatedResponse<CalendarEventDto>["pagination"] }>(
      withQuery("/api/calendar/events", params),
      { method: "GET", retries: 2, cache: "no-store" },
    ),
  getById: (id: string) =>
    request<{ event: CalendarEventDto }>(`/api/calendar/events/${id}`, { method: "GET", retries: 2 }),
  create: (payload: Record<string, unknown>) =>
    request<{ event: CalendarEventDto }>("/api/calendar/events", { method: "POST", body: payload }),
  update: (id: string, payload: Record<string, unknown>) =>
    request<{ event: CalendarEventDto }>(`/api/calendar/events/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => request<{ success: boolean }>(`/api/calendar/events/${id}`, { method: "DELETE" }),
};
