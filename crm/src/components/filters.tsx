"use client";

import { Input } from "@/components/ui/input";

type FiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  assignedToId: string;
  setAssignedToId: (value: string) => void;
  users: { id: string; name: string }[];
};

export function Filters({ search, setSearch, priority, setPriority, assignedToId, setAssignedToId, users }: FiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-3">
      <Input placeholder="Search tasks or lead" value={search} onChange={(e) => setSearch(e.target.value)} />
      <select
        className="h-10 rounded-lg border bg-card px-3 text-sm"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="">All priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <select
        className="h-10 rounded-lg border bg-card px-3 text-sm"
        value={assignedToId}
        onChange={(e) => setAssignedToId(e.target.value)}
      >
        <option value="">All assignees</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}


