"use client";

import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api-client/tasks-api";
import type { TaskListParams } from "@/lib/api-client/tasks.types";
import { tasksQueryKeys } from "@/lib/query/tasks-query";

export function useTasks(filters: TaskListParams) {
  return useQuery({
    queryKey: tasksQueryKeys.list(filters),
    queryFn: () => tasksApi.list(filters),
  });
}


