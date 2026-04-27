"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery } from "@tanstack/react-query";

export default function ReportsPage() {
  const { data: dashboard } = useQuery({
    queryKey: ["reports-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/reports/dashboard");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: sales } = useQuery({
    queryKey: ["reports-sales"],
    queryFn: async () => {
      const res = await fetch("/api/reports/sales");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Lead Conversion</p><p className="text-2xl font-bold">{dashboard?.leadConversionRate ?? 0}%</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Task Completion</p><p className="text-2xl font-bold">{dashboard?.taskCompletionRate ?? 0}%</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Call Success</p><p className="text-2xl font-bold">{dashboard?.callsPerformance?.successRate ?? 0}%</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Payments Received</p><p className="text-2xl font-bold">{dashboard?.salesPerformance?.paymentsReceived ?? 0}</p></div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Sales Deals</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Property</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody>
              {(sales?.deals ?? []).map((deal: any) => <tr key={deal.id} className="border-t"><td className="px-4 py-3">{deal.lead?.name}</td><td className="px-4 py-3">{deal.property?.name}</td><td className="px-4 py-3">{deal.value}</td><td className="px-4 py-3">{deal.status}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
