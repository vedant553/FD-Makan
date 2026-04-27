"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SiteVisitsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ leadId: "", propertyId: "", scheduledAt: "", notes: "", status: "SCHEDULED" });

  const { data } = useQuery({
    queryKey: ["site-visits"],
    queryFn: async () => {
      const res = await fetch("/api/site-visits");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: leadsData } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: propertiesData } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/site-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-visits"] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Site Visit Management</h1>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Schedule Visit</h2>
        <div className="grid gap-3 md:grid-cols-5">
          <select className="h-10 rounded-lg border bg-card px-3 text-sm" value={form.leadId} onChange={(e) => setForm((s) => ({ ...s, leadId: e.target.value }))}>
            <option value="">Lead</option>
            {(leadsData?.leads ?? []).map((lead: any) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
          </select>
          <select className="h-10 rounded-lg border bg-card px-3 text-sm" value={form.propertyId} onChange={(e) => setForm((s) => ({ ...s, propertyId: e.target.value }))}>
            <option value="">Property</option>
            {(propertiesData?.properties ?? []).map((prop: any) => <option key={prop.id} value={prop.id}>{prop.name}</option>)}
          </select>
          <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((s) => ({ ...s, scheduledAt: e.target.value }))} />
          <select className="h-10 rounded-lg border bg-card px-3 text-sm" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </select>
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
        </div>
        <Button className="mt-3" onClick={() => create.mutate()}>Create Site Visit</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Property</th><th className="px-4 py-3">Schedule</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Notes</th></tr></thead>
          <tbody>
            {(data?.siteVisits ?? []).map((visit: any) => (
              <tr key={visit.id} className="border-t"><td className="px-4 py-3">{visit.lead?.name}</td><td className="px-4 py-3">{visit.property?.name}</td><td className="px-4 py-3">{new Date(visit.scheduledAt).toLocaleString()}</td><td className="px-4 py-3">{visit.status}</td><td className="px-4 py-3">{visit.assignedTo?.name || "-"}</td><td className="px-4 py-3">{visit.notes || "-"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
