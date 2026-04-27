"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CallsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ phone: "", status: "CONNECTED", duration: 60, notes: "" });

  const { data: callsData, isLoading } = useQuery({
    queryKey: ["calls"],
    queryFn: async () => {
      const res = await fetch("/api/calls");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["call-stats"],
    queryFn: async () => {
      const res = await fetch("/api/calls/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["calls"] });
      await qc.invalidateQueries({ queryKey: ["call-stats"] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calling System</h1>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Total Calls</p><p className="text-2xl font-bold">{stats?.totalCalls ?? 0}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Successful</p><p className="text-2xl font-bold">{stats?.successfulCalls ?? 0}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Conversion %</p><p className="text-2xl font-bold">{stats?.conversionRate ?? 0}%</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Telecaller Records</p><p className="text-2xl font-bold">{stats?.telecallerPerformance?.length ?? 0}</p></div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Log Call</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
          <select className="h-10 rounded-lg border bg-card px-3 text-sm" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
            <option value="CONNECTED">Connected</option>
            <option value="MISSED">Missed</option>
            <option value="NO_ANSWER">No Answer</option>
          </select>
          <Input type="number" placeholder="Duration (sec)" value={form.duration} onChange={(e) => setForm((s) => ({ ...s, duration: Number(e.target.value) }))} />
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
        </div>
        <Button className="mt-3" onClick={() => create.mutate()}>Save Call Log</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Lead</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Notes</th><th className="px-4 py-3">Time</th></tr></thead>
          <tbody>
            {(callsData?.calls ?? []).map((call: any) => (
              <tr key={call.id} className="border-t"><td className="px-4 py-3">{call.phone}</td><td className="px-4 py-3">{call.lead?.name ?? "-"}</td><td className="px-4 py-3">{call.user?.name ?? "-"}</td><td className="px-4 py-3">{call.status}</td><td className="px-4 py-3">{call.duration}s</td><td className="px-4 py-3">{call.notes || "-"}</td><td className="px-4 py-3">{new Date(call.createdAt).toLocaleString()}</td></tr>
            ))}
            {!isLoading && (callsData?.calls?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No calls yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
