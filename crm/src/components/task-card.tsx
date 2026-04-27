"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TaskCardProps = {
  task: {
    id: string;
    title: string;
    description?: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    dueDate: string;
    lead: { name: string };
    category: "today" | "upcoming" | "overdue" | "completed";
  };
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

const priorityStyle = {
  LOW: "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  HIGH: "bg-red-100 text-red-700 border-red-200",
};

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">{task.title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Lead: {task.lead.name}</p>
        </div>
        <Badge className={priorityStyle[task.priority]}>{task.priority}</Badge>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">{task.description || "No description"}</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span>Due: {format(new Date(task.dueDate), "dd MMM yyyy, hh:mm a")}</span>
          <Badge className="bg-muted text-foreground">{task.status.replace("_", " ")}</Badge>
        </div>
        <div className="mt-4 flex gap-2">
          {task.status !== "COMPLETED" && (
            <Button size="sm" onClick={() => onComplete(task.id)}>
              Mark Complete
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => onDelete(task.id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


