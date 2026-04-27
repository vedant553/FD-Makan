import { redirect } from "next/navigation";

import { Shell } from "@/components/shell";
import { getAuthSession } from "@/lib/auth/guards";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  return (
    <Shell user={session.user}>
      {children}
    </Shell>
  );
}


