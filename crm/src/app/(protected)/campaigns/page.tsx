"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CampaignsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", source: "FACEBOOK", budget: 0, spent: 0 });
  const [integration, setIntegration] = useState({ provider: "facebook_ads", name: "", phone: "" });

  const { data } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const syncLead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/integrations/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: integration.provider, payload: { name: integration.name, phone: integration.phone } }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campaign / Marketing</h1>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Create Campaign</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          <select className="h-10 rounded-lg border bg-card px-3 text-sm" value={form.source} onChange={(e) => setForm((s) => ({ ...s, source: e.target.value }))}>
            <option value="FACEBOOK">Facebook</option>
            <option value="GOOGLE">Google</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="REFERRAL">Referral</option>
            <option value="WEBSITE">Website</option>
            <option value="OTHER">Other</option>
          </select>
          <Input type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm((s) => ({ ...s, budget: Number(e.target.value) }))} />
          <Input type="number" placeholder="Spent" value={form.spent} onChange={(e) => setForm((s) => ({ ...s, spent: Number(e.target.value) }))} />
        </div>
        <Button className="mt-3" onClick={() => create.mutate()}>Create Campaign</Button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Integrations Sync (Facebook/Google/WhatsApp)</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <select className="h-10 rounded-lg border bg-card px-3 text-sm" value={integration.provider} onChange={(e) => setIntegration((s) => ({ ...s, provider: e.target.value }))}>
            <option value="facebook_ads">Facebook Ads</option>
            <option value="google_ads">Google Ads</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <Input placeholder="Lead Name" value={integration.name} onChange={(e) => setIntegration((s) => ({ ...s, name: e.target.value }))} />
          <Input placeholder="Phone" value={integration.phone} onChange={(e) => setIntegration((s) => ({ ...s, phone: e.target.value }))} />
          <Button onClick={() => syncLead.mutate()}>Import Lead</Button>
        </div>
        {syncLead.data ? <p className="mt-2 text-sm text-muted-foreground">Lead imported: {syncLead.data.lead?.name}</p> : null}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Budget</th><th className="px-4 py-3">Spent</th><th className="px-4 py-3">Leads</th><th className="px-4 py-3">Revenue</th><th className="px-4 py-3">ROI%</th></tr></thead>
          <tbody>
            {(data?.campaigns ?? []).map((c: any) => {
              const roi = c.spent > 0 ? (((c.revenueGenerated - c.spent) / c.spent) * 100).toFixed(2) : "0.00";
              return <tr key={c.id} className="border-t"><td className="px-4 py-3">{c.name}</td><td className="px-4 py-3">{c.source}</td><td className="px-4 py-3">{c.budget}</td><td className="px-4 py-3">{c.spent}</td><td className="px-4 py-3">{c.leadsGenerated}</td><td className="px-4 py-3">{c.revenueGenerated}</td><td className="px-4 py-3">{roi}%</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
