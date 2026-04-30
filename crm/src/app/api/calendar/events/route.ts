import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, parseDomainQuery, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { createCalendarEvent, listCalendarEvents } from "@/server/modules/tasks/calendar.service";
import { calendarRangeSchema, createCalendarEventSchema } from "@/server/modules/tasks/calendar.validators";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const query = parseDomainQuery(calendarRangeSchema, {
      page: req.nextUrl.searchParams.get("page") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
      from: req.nextUrl.searchParams.get("from") ?? undefined,
      to: req.nextUrl.searchParams.get("to") ?? undefined,
      source: req.nextUrl.searchParams.get("source") ?? undefined,
      assigneeId: req.nextUrl.searchParams.get("assigneeId") ?? undefined,
      search: req.nextUrl.searchParams.get("search") ?? undefined,
    });
    const result = await listCalendarEvents(ctx, query);
    return tasksOk({ events: result.items, pagination: result.pagination });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTasksAuthContext();
    const payload = await parseDomainBody(createCalendarEventSchema, req);
    const event = await createCalendarEvent(ctx, payload);
    return tasksOk({ event }, { status: 201 });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
