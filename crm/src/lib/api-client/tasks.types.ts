export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type TaskDto = {
  id: string;
  title: string;
  description?: string | null;
  leadId: string;
  assignedToId?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  reminderTime?: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskListParams = {
  page?: number;
  limit?: number;
  search?: string;
  view?: "today" | "upcoming" | "overdue" | "completed";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  type?: string;
  activityType?: string;
  assignedToId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "dueDate" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  leadId: string;
  assignedToId?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  reminderTime?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  markComplete?: boolean;
};

export type SiteVisitDto = {
  id: string;
  leadId: string;
  propertyId: string;
  scheduledAt: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  notes?: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SiteVisitListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  assignedToId?: string;
  leadId?: string;
  propertyId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "scheduledAt" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type CalendarEventDto = {
  id: string;
  sourceType: "TASK" | "SITE_VISIT";
  sourceId: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  status?: string;
};

export type CalendarListParams = {
  page?: number;
  limit?: number;
  from: string;
  to: string;
  source?: "TASK" | "SITE_VISIT" | "ALL";
  assigneeId?: string;
  search?: string;
};
