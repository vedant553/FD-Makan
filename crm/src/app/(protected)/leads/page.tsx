"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLeads, useUsers } from "@/hooks/use-leads";

type LeadRecord = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  status: string;
  source: string;
  assignedTo?: { name: string } | null;
  _count: { tasks: number };
};

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useLeads();
  const { data: usersData } = useUsers();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "Website",
    status: "NEW",
    assignedToId: "",
  });

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create lead");
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-sm text-muted-foreground">Track pipeline and assignments across your team.</p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Create Lead</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <tbody>
              <tr className="border-b">
                <td className="w-40 py-3 font-medium">Name</td>
                <td className="py-3"><Input placeholder="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} /></td>
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Phone</td>
                <td className="py-3"><Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} /></td>
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Email</td>
                <td className="py-3"><Input placeholder="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} /></td>
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Source</td>
                <td className="py-3"><Input placeholder="Source" value={form.source} onChange={(e) => setForm((s) => ({ ...s, source: e.target.value }))} /></td>
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Status</td>
                <td className="py-3">
                  <select className="h-10 w-full rounded-lg border bg-card px-3 text-sm" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Assign To</td>
                <td className="py-3">
                  <select className="h-10 w-full rounded-lg border bg-card px-3 text-sm" value={form.assignedToId} onChange={(e) => setForm((s) => ({ ...s, assignedToId: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {(usersData?.users ?? []).map((user: { id: string; name: string }) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Button
          className="mt-4"
          onClick={() => {
            mutation.mutate({
              ...form,
              assignedToId: form.assignedToId || null,
            });
            setForm({ name: "", phone: "", email: "", source: "Website", status: "NEW", assignedToId: "" });
          }}
        >
          Add Lead
        </Button>
      </div>

      {isLoading && <p>Loading leads...</p>}
      {error && <p>Unable to load leads.</p>}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Tasks</th>
            </tr>
          </thead>
          <tbody>
            {(data?.leads ?? []).map((lead: LeadRecord) => (
              <tr key={lead.id} className="border-t">
                <td className="px-4 py-3">{lead.name}</td>
                <td className="px-4 py-3">{lead.phone}</td>
                <td className="px-4 py-3">{lead.email || "-"}</td>
                <td className="px-4 py-3">{lead.status}</td>
                <td className="px-4 py-3">{lead.source}</td>
                <td className="px-4 py-3">{lead.assignedTo?.name || "Unassigned"}</td>
                <td className="px-4 py-3">{lead._count.tasks}</td>
              </tr>
            ))}
            {!isLoading && (data?.leads?.length ?? 0) === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
