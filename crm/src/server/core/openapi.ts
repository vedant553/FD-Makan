export type OpenApiRouteDoc = {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  tag: string;
  summary: string;
  operationId: string;
  auth: "session" | "public";
};

/**
 * OpenAPI-ready metadata registry.
 * Keep route docs close to handlers for future /manage/api-doc generation.
 */
export function defineRouteDoc<T extends OpenApiRouteDoc>(doc: T): T {
  return doc;
}
