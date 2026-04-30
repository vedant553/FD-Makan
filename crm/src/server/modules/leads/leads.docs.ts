import { defineRouteDoc } from "@/server/core/openapi";

export const listLeadsDoc = defineRouteDoc({
  method: "get",
  path: "/api/leads",
  tag: "Leads",
  summary: "List leads with pagination and filters",
  operationId: "listLeads",
  auth: "session",
});

export const createLeadDoc = defineRouteDoc({
  method: "post",
  path: "/api/leads",
  tag: "Leads",
  summary: "Create a lead",
  operationId: "createLead",
  auth: "session",
});

export const updateLeadDoc = defineRouteDoc({
  method: "put",
  path: "/api/leads/{id}",
  tag: "Leads",
  summary: "Update lead",
  operationId: "updateLead",
  auth: "session",
});
