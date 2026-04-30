export type TaskRole = "ADMIN" | "MANAGER" | "AGENT";

export type TaskActionPermissions = {
  create: boolean;
  update: boolean;
  delete: boolean;
  assign: boolean;
  reassign: boolean;
  complete: boolean;
  export: boolean;
};

export function getTaskActionPermissions(role: TaskRole): TaskActionPermissions {
  if (role === "ADMIN") {
    return {
      create: true,
      update: true,
      delete: true,
      assign: true,
      reassign: true,
      complete: true,
      export: true,
    };
  }

  if (role === "MANAGER") {
    return {
      create: true,
      update: true,
      delete: true,
      assign: true,
      reassign: true,
      complete: true,
      export: true,
    };
  }

  return {
    create: true,
    update: true,
    delete: false,
    assign: false,
    reassign: false,
    complete: true,
    export: false,
  };
}
