import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import {
  deleteCalendarEvent,
  getCalendarEventById,
  updateCalendarEvent,
} from "@/server/modules/tasks/calendar.service";
import { updateCalendarEventSchema } from "@/server/modules/tasks/calendar.validators";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    const event = await getCalendarEventById(ctx, id);
    return tasksOk({ event });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    const payload = await parseDomainBody(updateCalendarEventSchema, req);
    const event = await updateCalendarEvent(ctx, id, payload);
    return tasksOk({ event });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    const result = await deleteCalendarEvent(ctx, id);
    return tasksOk(result);
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
