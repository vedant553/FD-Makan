"use client";

import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api-client/tasks-api";
import { tasksQueryKeys } from "@/lib/query/tasks-query";

type TaskFilters = {
  page?: number;
  limit?: number;
  view?: string;
  status?: string;
  priority?: string;
  type?: string;
  activityType?: string;
  assignedToId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
};

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: tasksQueryKeys.list(filters),
    queryFn: () => tasksApi.list(filters),
  });
}


