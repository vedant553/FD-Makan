"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { calendarApi, siteVisitsApi, tasksApi } from "@/lib/api-client/tasks-api";
import type { CalendarListParams, SiteVisitListParams, TaskListParams, UpdateTaskInput } from "@/lib/api-client/tasks.types";
import { invalidateTasksModuleQueries, tasksQueryKeys } from "@/lib/query/tasks-query";

export function useTasksList(params: TaskListParams) {
  return useQuery({
    queryKey: tasksQueryKeys.list(params),
    queryFn: () => tasksApi.list(params),
  });
}

export function useSiteVisitsList(params: SiteVisitListParams) {
  return useQuery({
    queryKey: tasksQueryKeys.siteVisitsList(params),
    queryFn: () => siteVisitsApi.list(params),
  });
}

export function useCalendarEvents(params: CalendarListParams) {
  return useQuery({
    queryKey: tasksQueryKeys.calendarList(params),
    queryFn: () => calendarApi.list(params),
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const commonSuccess = async () => invalidateTasksModuleQueries(queryClient);

  return {
    create: useMutation({
      mutationFn: tasksApi.create,
      onSuccess: commonSuccess,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskInput }) => tasksApi.update(id, payload),
      onSuccess: commonSuccess,
    }),
    remove: useMutation({
      mutationFn: (id: string) => tasksApi.remove(id),
      onSuccess: commonSuccess,
    }),
    complete: useMutation({
      mutationFn: (id: string) => tasksApi.complete(id),
      onSuccess: commonSuccess,
    }),
    assign: useMutation({
      mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) => tasksApi.assign(id, assignedToId),
      onSuccess: commonSuccess,
    }),
  };
}
