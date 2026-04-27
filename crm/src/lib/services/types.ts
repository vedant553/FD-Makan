export type AuthContext = {
  userId: string;
  role: "ADMIN" | "MANAGER" | "AGENT";
  organizationId: string;
};

