"use client";

import { useQuery } from "@tanstack/react-query";

type LeadsQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  status?: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
  assignedToId?: string;
  source?: string;
};

function withQuery(path: string, params: LeadsQueryParams) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const str = qs.toString();
  return str ? `${path}?${str}` : path;
}

export function useLeads(params: LeadsQueryParams = {}) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: async () => {
      const res = await fetch(withQuery("/api/leads", params), { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch leads");
      const payload = await res.json();
      if (payload?.data) {
        return {
          leads: payload.data.leads ?? [],
          pagination: payload.meta?.pagination,
        };
      }
      return {
        leads: payload?.leads ?? [],
        pagination: payload?.pagination ?? payload?.meta?.pagination,
      };
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}


