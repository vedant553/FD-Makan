"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

export default function TeamPage() {
  const qc = useQueryClient();
  const [attendance, setAttendance] = useState({ userId: "", status: "PRESENT" });

  const { data: perf } = useQuery({
    queryKey: ["team-performance"],
    queryFn: async () => {
      const res = await fetch("/api/team/performance");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["team-attendance"],
    queryFn: async () => {
      const res = await fetch("/api/team/attendance");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const mark = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/team/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendance),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-attendance"] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team Management</h1>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Mark Attendance</h2>
        <div className="flex gap-3">
          <select className="h-10 min-w-[260px] rounded-lg border bg-card px-3 text-sm" value={attendance.userId} onChange={(e) => setAttendance((s) => ({ ...s, userId: e.target.value }))}>
            <option value="">Select user</option>
            {(users?.users ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select className="h-10 min-w-[160px] rounded-lg border bg-card px-3 text-sm" value={attendance.status} onChange={(e) => setAttendance((s) => ({ ...s, status: e.target.value }))}>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="WFH">WFH</option>
          </select>
          <Button onClick={() => mark.mutate()} disabled={!attendance.userId}>Save</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Tasks Completed</th><th className="px-4 py-3">Calls</th><th className="px-4 py-3">Successful Calls</th><th className="px-4 py-3">Conversions</th></tr></thead>
            <tbody>
              {(perf?.members ?? []).map((m: any) => <tr key={m.id} className="border-t"><td className="px-4 py-3">{m.name}</td><td className="px-4 py-3">{m.role}</td><td className="px-4 py-3">{m.tasksCompleted}</td><td className="px-4 py-3">{m.callsMade}</td><td className="px-4 py-3">{m.successfulCalls}</td><td className="px-4 py-3">{m.conversions}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Attendance Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr></thead>
            <tbody>
              {(attendanceData?.attendance ?? []).map((a: any) => <tr key={a.id} className="border-t"><td className="px-4 py-3">{a.user?.name}</td><td className="px-4 py-3">{a.status}</td><td className="px-4 py-3">{new Date(a.date).toLocaleDateString()}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
