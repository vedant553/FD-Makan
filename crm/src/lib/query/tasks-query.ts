import type { QueryClient } from "@tanstack/react-query";

import type { CalendarListParams, SiteVisitListParams, TaskListParams } from "@/lib/api-client/tasks.types";

export const tasksQueryKeys = {
  all: ["tasks"] as const,
  list: (params: TaskListParams) => ["tasks", "list", params] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
  siteVisitsList: (params: SiteVisitListParams) => ["tasks", "siteVisits", "list", params] as const,
  calendarList: (params: CalendarListParams) => ["tasks", "calendar", "list", params] as const,
  timeline: (leadId?: string, taskId?: string, page = 1, limit = 30) =>
    ["tasks", "timeline", { leadId, taskId, page, limit }] as const,
  sla: (params: { dateFrom?: string; dateTo?: string; assigneeId?: string }) =>
    ["tasks", "sla", params] as const,
};

export async function invalidateTasksModuleQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: tasksQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: ["tasks", "siteVisits"] }),
    queryClient.invalidateQueries({ queryKey: ["tasks", "calendar"] }),
    queryClient.invalidateQueries({ queryKey: ["tasks", "timeline"] }),
    queryClient.invalidateQueries({ queryKey: ["tasks", "sla"] }),
  ]);
}
