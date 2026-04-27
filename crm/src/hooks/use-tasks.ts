"use client";

import { useQuery } from "@tanstack/react-query";

type TaskFilters = {
  view?: string;
  priority?: string;
  assignedToId?: string;
  search?: string;
};

export function useTasks(filters: TaskFilters) {
  const params = new URLSearchParams();
  if (filters.view) params.set("view", filters.view);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.assignedToId) params.set("assignedToId", filters.assignedToId);
  if (filters.search) params.set("search", filters.search);

  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });
}


