import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { deleteSiteVisit, getSiteVisitById, updateSiteVisit } from "@/server/modules/tasks/site-visits.service";
import { updateSiteVisitSchema } from "@/server/modules/tasks/site-visits.validators";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    return tasksOk({ siteVisit: await getSiteVisitById(ctx, id) });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    const payload = await parseDomainBody(updateSiteVisitSchema, req);
    return tasksOk({ siteVisit: await updateSiteVisit(ctx, id, payload) });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    return tasksOk(await deleteSiteVisit(ctx, id));
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
