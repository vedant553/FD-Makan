import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getTaskCategory(task: { dueDate: Date; status: string }) {
  if (task.status === "COMPLETED") return "completed" as const;

  const now = new Date();
  const start = startOfToday();
  const end = endOfToday();

  if (task.dueDate < now) return "overdue" as const;
  if (task.dueDate >= start && task.dueDate <= end) return "today" as const;
  return "upcoming" as const;
}

