import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import {
  parseDomainBody,
  parseDomainQuery,
  tasksErrorResponse,
  tasksOk,
} from "@/server/modules/tasks/tasks.domain";
import { createTask, listTasks } from "@/server/modules/tasks/tasks.service";
import { createTaskSchema, taskFilterSchema } from "@/server/modules/tasks/tasks.validators";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const filters = parseDomainQuery(taskFilterSchema, {
      page: req.nextUrl.searchParams.get("page") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
      view: req.nextUrl.searchParams.get("view") ?? undefined,
      status: req.nextUrl.searchParams.get("status") ?? undefined,
      priority: req.nextUrl.searchParams.get("priority") ?? undefined,
      type: req.nextUrl.searchParams.get("type") ?? undefined,
      activityType: req.nextUrl.searchParams.get("activityType") ?? undefined,
      assignedToId: req.nextUrl.searchParams.get("assignedToId") ?? undefined,
      search: req.nextUrl.searchParams.get("search") ?? undefined,
      dateFrom: req.nextUrl.searchParams.get("dateFrom") ?? undefined,
      dateTo: req.nextUrl.searchParams.get("dateTo") ?? undefined,
      sortBy: req.nextUrl.searchParams.get("sortBy") ?? undefined,
      sortOrder: req.nextUrl.searchParams.get("sortOrder") ?? undefined,
    });
    const result = await listTasks(ctx, filters);
    return tasksOk({ tasks: result.items, pagination: result.pagination });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const payload = await parseDomainBody(createTaskSchema, req);
    const task = await createTask(ctx, payload);
    return tasksOk({ task }, { status: 201 });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}


