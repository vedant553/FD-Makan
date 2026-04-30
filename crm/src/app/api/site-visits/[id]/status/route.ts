import { NextRequest } from "next/server";

import { getTasksAuthContext } from "@/server/modules/tasks/tasks.auth";
import { parseDomainBody, tasksErrorResponse, tasksOk } from "@/server/modules/tasks/tasks.domain";
import { transitionSiteVisitStatus } from "@/server/modules/tasks/site-visits.service";
import { updateSiteVisitStatusSchema } from "@/server/modules/tasks/site-visits.validators";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTasksAuthContext();
    const { id } = await params;
    const payload = await parseDomainBody(updateSiteVisitStatusSchema, req);
    const siteVisit = await transitionSiteVisitStatus(ctx, id, payload.status);
    return tasksOk({ siteVisit });
  } catch (error) {
    return tasksErrorResponse(error);
  }
}
