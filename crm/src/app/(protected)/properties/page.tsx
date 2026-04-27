"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PropertiesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", price: 0, location: "", status: "AVAILABLE" });
  const [leadIdForMatch, setLeadIdForMatch] = useState("");

  const { data: propsData } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties");
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

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });

  const match = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/properties/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: leadIdForMatch }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory / Properties</h1>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Add Property</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          <Input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))} />
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
          <select className="h-10 rounded-lg border bg-card px-3 text-sm" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
            <option value="AVAILABLE">Available</option>
            <option value="SOLD">Sold</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
        <Button className="mt-3" onClick={() => create.mutate()}>Create Property</Button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Property Matching</h2>
        <div className="flex gap-3">
          <select className="h-10 min-w-[260px] rounded-lg border bg-card px-3 text-sm" value={leadIdForMatch} onChange={(e) => setLeadIdForMatch(e.target.value)}>
            <option value="">Select lead</option>
            {(leadsData?.leads ?? []).map((lead: any) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
          </select>
          <Button onClick={() => match.mutate()} disabled={!leadIdForMatch}>Run Match</Button>
        </div>
        {match.data ? <p className="mt-2 text-sm text-muted-foreground">Matches created: {match.data.matches.length}</p> : null}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Leads</th><th className="px-4 py-3">Visits</th></tr></thead>
          <tbody>
            {(propsData?.properties ?? []).map((prop: any) => (
              <tr key={prop.id} className="border-t"><td className="px-4 py-3">{prop.name}</td><td className="px-4 py-3">{prop.price}</td><td className="px-4 py-3">{prop.location}</td><td className="px-4 py-3">{prop.status}</td><td className="px-4 py-3">{prop.assignedTo?.name || "-"}</td><td className="px-4 py-3">{prop._count.leads}</td><td className="px-4 py-3">{prop._count.siteVisits}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
