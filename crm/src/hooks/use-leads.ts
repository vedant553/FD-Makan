"use client";

import { useQuery } from "@tanstack/react-query";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
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


